// models/crash.js
const mongoose = require('mongoose');

const crashSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
  message: { type: String },
  stack: { type: String },
  platform: { type: String, index: true },
  appVersion: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

const Crash = mongoose.model('Crash', crashSchema);
module.exports = Crash;