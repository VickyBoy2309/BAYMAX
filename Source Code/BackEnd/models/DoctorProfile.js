const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  hospital: { type: String, required: true },
  address: { type: String, default: 'Maduravoyal, Chennai' },
  latitude: { type: Number, default: 13.0645 },
  longitude: { type: Number, default: 80.1654 },
  waitingCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
