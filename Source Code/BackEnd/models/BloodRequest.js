const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'fulfilled', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
