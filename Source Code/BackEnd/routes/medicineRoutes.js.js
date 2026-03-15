const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;