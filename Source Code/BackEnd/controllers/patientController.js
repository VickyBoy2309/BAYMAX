const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Cart = require('../models/Cart');
const LabTest = require('../models/LabTest');
const LabBooking = require('../models/LabBooking');
const BloodRequest = require('../models/BloodRequest');

// --- DOCTOR & APPOINTMENT ---
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isApproved: true }).select('-password');
    const doctorProfiles = await DoctorProfile.find({ user: { $in: doctors.map(d => d._id) } })
                                             .populate('user', 'name email');
    res.json(doctorProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;
  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Increment waiting count in Doctor Profile
    const profile = await DoctorProfile.findOne({ user: doctorId });
    if(profile) {
      profile.waitingCount += 1;
      await profile.save();
    }

    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      status: 'pending'
    });

    const savedAppointment = await appointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    const enhancedAppointments = await Promise.all(appointments.map(async (apt) => {
      const docProfile = await DoctorProfile.findOne({ user: apt.doctor._id });
      return { ...apt._doc, doctorProfile: docProfile };
    }));
    res.json(enhancedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- MEDICINES & CART ---
const getMedicines = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const medicines = await Medicine.find(query).populate('pharmacy');
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ patient: req.user.id }).populate('items.medicine');
    if (!cart) {
      cart = await Cart.create({ patient: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  const { medicineId } = req.body;
  try {
    let cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) cart = new Cart({ patient: req.user.id, items: [] });

    const itemIndex = cart.items.findIndex(item => item.medicine.toString() === medicineId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ medicine: medicineId, quantity: 1 });
    }
    await cart.save();
    cart = await cart.populate('items.medicine');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ patient: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = cart.items.filter(item => item.medicine.toString() !== req.params.medicineId);
    await cart.save();
    cart = await cart.populate('items.medicine');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkoutCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ patient: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Checkout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LAB TESTS ---
const getLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookLabTest = async (req, res) => {
  const { labTestId } = req.body;
  try {
    const booking = new LabBooking({
      patient: req.user.id,
      labTest: labTestId,
      status: 'pending'
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLabBookings = async (req, res) => {
  try {
    const bookings = await LabBooking.find({ patient: req.user.id }).populate('labTest');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BLOOD BANK ---
const getBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBloodRequest = async (req, res) => {
  const { bloodGroup } = req.body;
  try {
    const request = new BloodRequest({
      bloodGroup,
      patient: req.user.id,
      status: 'pending'
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getDoctors, bookAppointment, getAppointments,
  getMedicines, getCart, addToCart, removeFromCart, checkoutCart,
  getLabTests, bookLabTest, getLabBookings,
  getBloodRequests, createBloodRequest
};
