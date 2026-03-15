const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    // Handle waiting count updates if needed (e.g., if approved, maybe waiting count isn't affected until marked done)
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAppointmentDone = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = 'completed';
    await appointment.save();

    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (profile.waitingCount > 0) profile.waitingCount -= 1;
    profile.completedCount += 1;
    await profile.save();

    res.json({ message: 'Appointment marked as done', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWaitingCount = async (req, res) => {
    try {
        const { count } = req.body;
        const profile = await DoctorProfile.findOne({ user: req.user._id });
        if(!profile) return res.status(404).json({ message: "Profile not found" });

        profile.waitingCount = count;
        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
