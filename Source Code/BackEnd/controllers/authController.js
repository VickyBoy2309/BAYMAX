const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      experience,
      hospital
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-approve patients & admins
    const isApproved = role === 'patient' || role === 'admin';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      isApproved
    });

    // If role is doctor, create doctor profile
    if (role === 'doctor') {
      await DoctorProfile.create({
        user: user._id,
        specialization,
        experience,
        hospital,
        address: 'Maduravoyal, Chennai' // As per your requirement
      });
    }

    // Send response
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};


/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /**
     * Hardcoded Admin Login (Keeping your logic unchanged)
     */
    if (
      (email === 'admin' || email === 'admin@baymax.com') &&
      password === 'admin@baymax'
    ) {
      let adminUser = await User.findOne({ role: 'admin' });

      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin',
          email: 'admin@baymax.com',
          password: 'admin@baymax',
          role: 'admin',
          isApproved: true
        });
      }

      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isApproved: adminUser.isApproved,
        token: generateToken(adminUser._id)
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

      // Doctor approval check
      if (user.role === 'doctor' && !user.isApproved) {
        return res.status(403).json({
          message: 'Your account is pending admin approval.'
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id)
      });

    } else {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};