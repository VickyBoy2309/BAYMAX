const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

// GET all lab tests
router.get('/', async (req, res) => {
  try {
    const tests = await LabTest.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;