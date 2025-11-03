// models/purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  productId: { type: String },
  type: { type: String, enum: ['purchase', 'subscription'], default: 'purchase' },
  platform: { type: String },
  appVersion: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;