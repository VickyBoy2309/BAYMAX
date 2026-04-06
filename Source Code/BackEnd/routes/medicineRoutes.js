const express = require('express');
const router = express.Router();

const { getMedicines, addMedicine } = require('../controllers/medicineController');

router.get('/', getMedicines);
router.post('/', addMedicine);

module.exports = router;