// controllers/analyticsController.js
const Session = require('../models/session');
const Event = require('../models/event');
const Crash = require('../models/crash');
const Purchase = require('../models/purchase');
const geoip = require('geoip-lite');

exports.startSession = async (req, res) => {
  try {
    const { platform, deviceModel, appVersion, country: clientCountry, region: clientRegion, city: clientCity, startedAt } = req.body;

    // Derive geo from IP (prefer this over client-provided locale)
    const forwarded = (req.headers['x-forwarded-for'] || '').toString();
    const ip = (forwarded.split(',')[0] || req.ip || '').trim();
    let lookup = null;
    try { if (ip) lookup = geoip.lookup(ip); } catch (_) {}

    const country = (lookup && lookup.country) || clientCountry || 'unknown';
    const region = (lookup && lookup.region) || clientRegion;
    const city = (lookup && lookup.city) || clientCity;

    const session = await Session.create({
      userId: req.user._id,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      platform,
      deviceModel,
      appVersion,
      country,
      region,
      city,
    });
    return res.json({ sessionId: session._id, startedAt: session.startedAt });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId, endedAt } = req.body;
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.endedAt = endedAt ? new Date(endedAt) : new Date();
    session.durationMs = Math.max(0, session.endedAt - session.startedAt);
    await session.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.logEvent = async (req, res) => {
  try {
    const { sessionId, name, properties, createdAt } = req.body;
    const event = await Event.create({
      userId: req.user._id,
      sessionId,
      name,
      properties: properties || {},
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
    return res.json({ eventId: event._id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.logCrash = async (req, res) => {
  try {
    const { sessionId, message, stack, platform, appVersion, createdAt } = req.body;
    const crash = await Crash.create({
      userId: req.user?._id,
      sessionId,
      message,
      stack,
      platform,
      appVersion,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
    return res.json({ crashId: crash._id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.logPurchase = async (req, res) => {
  try {
    const { amount, currency, productId, type, platform, appVersion, createdAt } = req.body;
    const purchase = await Purchase.create({
      userId: req.user._id,
      amount,
      currency: currency || 'USD',
      productId,
      type: type || 'purchase',
      platform,
      appVersion,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
    return res.json({ purchaseId: purchase._id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};