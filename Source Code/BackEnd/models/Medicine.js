const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  price: Number,
  availability: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);