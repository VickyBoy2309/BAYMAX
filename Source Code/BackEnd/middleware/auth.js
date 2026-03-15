const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as doctor' });
  }
};

module.exports = { protect, admin, doctor };
