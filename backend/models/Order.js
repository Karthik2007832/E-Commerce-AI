const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed because it could be mock string or ObjectId
  fullName: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  zipCode: { type: String },
  paymentMethod: { type: String },
  totalAmount: { type: Number, required: true },
  cart: [cartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
