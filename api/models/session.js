// models/session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  startedAt: { type: Date, required: true, index: true },
  endedAt: { type: Date },
  durationMs: { type: Number },
  platform: { type: String, index: true }, // ios | android | web
  deviceModel: { type: String },
  appVersion: { type: String },
  country: { type: String, index: true },
  region: { type: String },
  city: { type: String },
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;