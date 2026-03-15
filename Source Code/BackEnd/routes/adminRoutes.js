const express = require('express');
const { getPendingDoctors, approveDoctor, rejectDoctor } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.use(protect, admin);

router.get('/pending-doctors', getPendingDoctors);
router.put('/approve-doctor/:id', approveDoctor);
router.delete('/reject-doctor/:id', rejectDoctor);

module.exports = router;
