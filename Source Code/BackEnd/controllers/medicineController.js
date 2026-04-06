const Medicine = require('../models/Medicine');

// GET all medicines
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    console.log("💊 Medicines fetched:", medicines.length);

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD medicine (for testing)
const addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const saved = await medicine.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMedicines, addMedicine };