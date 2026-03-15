const express = require('express');
const { getAppointments, updateAppointmentStatus, markAppointmentDone, getProfile, updateWaitingCount } = require('../controllers/doctorController');
const { protect, doctor } = require('../middleware/auth');
const router = express.Router();

router.use(protect, doctor);

router.get('/appointments', getAppointments);
router.put('/appointment/:id/status', updateAppointmentStatus);
router.put('/appointment/:id/done', markAppointmentDone);
router.get('/profile', getProfile);
router.put('/waiting-count', updateWaitingCount);

module.exports = router;
