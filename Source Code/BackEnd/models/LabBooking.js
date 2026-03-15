const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labTest: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
