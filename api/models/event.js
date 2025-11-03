// models/event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
  name: { type: String, index: true, required: true },
  properties: { type: Object },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;