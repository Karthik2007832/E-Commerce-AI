const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Number, required: true }, // refers to externalId
  type: { type: String, enum: ['click', 'view', 'add-to-cart', 'purchase'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interaction', interactionSchema);
