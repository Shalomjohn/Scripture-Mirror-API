// controllers/adminController.js
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Session = require('../models/session');
const Event = require('../models/event');
const Crash = require('../models/crash');
const Purchase = require('../models/purchase');
const User = require('../models/user');

function parseDate(d) {
  return new Date(d);
}
function startOfDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function safeZone(input) {
  if (!input || typeof input !== 'string') return 'UTC';
  const z = input.trim();
  if (!z) return 'UTC';
  const dt = DateTime.now().setZone(z);
  return dt.isValid ? z : 'UTC';
}

function parseISODateInZone(yyyyMMdd, zone) {
  // Date input from the admin UI is yyyy-MM-dd.
  const dt = DateTime.fromISO(yyyyMMdd, { zone });
  if (!dt.isValid) throw new Error('Invalid date');
  return dt;
}

function startOfDayInZone(dt) {
  return dt.startOf('day').toUTC().toJSDate();
}

function endOfDayInZone(dt) {
  return dt.endOf('day').toUTC().toJSDate();
}

exports.getOverviewMetrics = async (req, res) => {
  try {
    // Ensure CORS and caching headers even on success
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Vary', 'Origin');
    res.set('Cache-Control', 'no-store');

    const tz = safeZone(req.query.tz);

    // Interpret date inputs (yyyy-MM-dd) in the admin's timezone, then convert
    // to UTC instants for querying Mongo.
    const nowZ = DateTime.now().setZone(tz);
    const endZ = req.query.end
      ? parseISODateInZone(req.query.end, tz).endOf('day')
      : nowZ.endOf('day');

    // Default to a lighter 7-day window to avoid cold-start timeouts on serverless
    const startZ = req.query.start
      ? parseISODateInZone(req.query.start, tz).startOf('day')
      : endZ.minus({ days: 6 }).startOf('day');

    const start = startZ.toUTC().toJSDate();
    const end = endZ.toUTC().toJSDate();

    // DAU
    const dau = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone: tz,
            },
          },
          users: { $addToSet: '$userId' },
        },
      },
      { $project: { date: '$_id', count: { $size: '$users' }, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    // WAU (ISO week)
    const wau = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      { $group: { _id: { year: { $isoWeekYear: '$startedAt' }, week: { $isoWeek: '$startedAt' } }, users: { $addToSet: '$userId' } } },
      { $project: { year: '$_id.year', week: '$_id.week', count: { $size: '$users' }, _id: 0 } },
      { $sort: { year: 1, week: 1 } }
    ]);

    // New sign-ups
    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: tz,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { date: '$_id', count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    // Sessions + avg duration
    const sessionsAgg = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: 1 }, avgDurationMs: { $avg: '$durationMs' }, activeUsers: { $addToSet: '$userId' } } },
      { $project: { _id: 0, total: 1, avgDurationMs: { $ifNull: ['$avgDurationMs', 0] }, activeUsersCount: { $size: '$activeUsers' } } }
    ]);
    const sessionsSummary = sessionsAgg[0] || { total: 0, avgDurationMs: 0, activeUsersCount: 0 };

    // Crash rates per 1000 sessions
    const [crashCountAgg] = await Crash.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const crashCount = crashCountAgg?.count || 0;
    const crashRatePerK = sessionsSummary.total > 0 ? (crashCount / sessionsSummary.total) * 1000 : 0;

    // Feature usage (top events)
    const featureUsage = await Event.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$name', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Geo distribution
    const geo = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $project: { country: { $ifNull: ['$_id', 'unknown'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Platform breakdown
    const platforms = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $project: { platform: { $ifNull: ['$_id', 'unknown'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Revenue & ARPU
    const revenueAgg = await Purchase.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, purchases: { $sum: 1 } } },
      { $project: { _id: 0, totalRevenue: 1, purchases: 1 } }
    ]);
    const revenue = revenueAgg[0] || { totalRevenue: 0, purchases: 0 };
    const ARPU = sessionsSummary.activeUsersCount > 0 ? revenue.totalRevenue / sessionsSummary.activeUsersCount : 0;

    // Retention (approximate): compute average D1/D7/D30 over cohorts in window
    const dayCount = Math.floor(endZ.diff(startZ, 'days').days) + 1;
    let rD1 = 0,
      rD7 = 0,
      rD30 = 0,
      cohorts = 0;

    for (let i = 0; i < dayCount; i++) {
      const cohortZ = startZ.plus({ days: i }).startOf('day');
      if (cohortZ > endZ) break;

      const cohortStart = startOfDayInZone(cohortZ);
      const cohortEnd = endOfDayInZone(cohortZ);

      const usersOnDay = await User.find({
        createdAt: { $gte: cohortStart, $lte: cohortEnd },
      }).select('_id');

      const cohortSize = usersOnDay.length;
      if (cohortSize === 0) continue;
      cohorts++;
      const userIds = usersOnDay.map((u) => u._id);

      const d1Start = startOfDayInZone(cohortZ.plus({ days: 1 }));
      const d1End = endOfDayInZone(cohortZ.plus({ days: 1 }));
      const d7Start = startOfDayInZone(cohortZ.plus({ days: 7 }));
      const d7End = endOfDayInZone(cohortZ.plus({ days: 7 }));
      const d30Start = startOfDayInZone(cohortZ.plus({ days: 30 }));
      const d30End = endOfDayInZone(cohortZ.plus({ days: 30 }));

      const d1 = await Session.countDocuments({
        userId: { $in: userIds },
        startedAt: { $gte: d1Start, $lte: d1End },
      });
      const d7 = await Session.countDocuments({
        userId: { $in: userIds },
        startedAt: { $gte: d7Start, $lte: d7End },
      });
      const d30 = await Session.countDocuments({
        userId: { $in: userIds },
        startedAt: { $gte: d30Start, $lte: d30End },
      });

      rD1 += d1 > 0 ? (Math.min(d1, cohortSize) / cohortSize) : 0;
      rD7 += d7 > 0 ? (Math.min(d7, cohortSize) / cohortSize) : 0;
      rD30 += d30 > 0 ? (Math.min(d30, cohortSize) / cohortSize) : 0;
    }
    const retention = cohorts > 0 ? {
      d1: Number((rD1 / cohorts * 100).toFixed(2)),
      d7: Number((rD7 / cohorts * 100).toFixed(2)),
      d30: Number((rD30 / cohorts * 100).toFixed(2)),
    } : { d1: 0, d7: 0, d30: 0 };

    return res.json({
      range: { start, end },
      dau,
      wau,
      signups,
      sessions: { total: sessionsSummary.total, avgDurationMs: Math.round(sessionsSummary.avgDurationMs || 0) },
      retention,
      crashes: { total: crashCount, ratePerThousandSessions: Number(crashRatePerK.toFixed(2)) },
      featureUsage,
      geo,
      platforms,
      revenue: { total: revenue.totalRevenue, purchases: revenue.purchases, arpu: Number(ARPU.toFixed(2)) },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Admin-only purge analytics endpoint
exports.deleteAnalytics = async (req, res) => {
  try {
    const q = { ...(req.query || {}), ...(req.body || {}) };
    if (q.confirm !== 'PURGE') {
      return res.status(400).json({ message: 'Confirmation required: add confirm=PURGE' });
    }
    const toDate = (s) => s ? endOfDay(parseDate(s)) : null;
    const fromDate = (s) => s ? startOfDay(parseDate(s)) : null;

    const end = toDate(q.end);
    const start = fromDate(q.start);

    const types = (q.types || 'all').split(',').map(s => s.trim().toLowerCase());
    const doAll = types.includes('all');

    const rangeFilter = (field) => {
      if (!start && !end) return {};
      const f = {};
      if (start) f.$gte = start;
      if (end) f.$lte = end;
      return { [field]: f };
    };

    const results = {};

    if (doAll || types.includes('sessions')) {
      const filter = rangeFilter('startedAt');
      results.sessionsBefore = await Session.countDocuments(filter);
      const r = await Session.deleteMany(filter);
      results.sessionsDeleted = r.deletedCount || 0;
    }
    if (doAll || types.includes('events')) {
      const filter = rangeFilter('createdAt');
      results.eventsBefore = await Event.countDocuments(filter);
      const r = await Event.deleteMany(filter);
      results.eventsDeleted = r.deletedCount || 0;
    }
    if (doAll || types.includes('crashes')) {
      const filter = rangeFilter('createdAt');
      results.crashesBefore = await Crash.countDocuments(filter);
      const r = await Crash.deleteMany(filter);
      results.crashesDeleted = r.deletedCount || 0;
    }
    if (doAll || types.includes('purchases')) {
      const filter = rangeFilter('createdAt');
      results.purchasesBefore = await Purchase.countDocuments(filter);
      const r = await Purchase.deleteMany(filter);
      results.purchasesDeleted = r.deletedCount || 0;
    }

    return res.json({ message: 'Analytics purge completed', range: { start, end }, results });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
