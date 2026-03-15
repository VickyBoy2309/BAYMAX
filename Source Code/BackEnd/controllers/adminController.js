const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: 'doctor', isApproved: false }).select('-password');
    
    // Fetch profiles for these doctors
    const doctorsWithProfiles = await Promise.all(pendingDoctors.map(async (doc) => {
      const profile = await DoctorProfile.findOne({ user: doc._id });
      return { ...doc.toObject(), profile };
    }));

    res.json(doctorsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.isApproved = true;
    await doctor.save();
    res.json({ message: 'Doctor approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    await DoctorProfile.findOneAndDelete({ user: req.params.id });
    res.json({ message: 'Doctor rejected and removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
