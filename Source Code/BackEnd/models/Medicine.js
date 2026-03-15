const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    type: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    description: String,
    requiresPrescription: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);