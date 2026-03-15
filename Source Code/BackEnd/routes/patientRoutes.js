const express = require('express');
const router = express.Router();
const { 
  getDoctors, 
  bookAppointment, 
  getAppointments,
  getMedicines,
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
  getLabTests,
  bookLabTest,
  getLabBookings,
  getBloodRequests,
  createBloodRequest
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/doctors', getDoctors);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);

router.get('/medicines', getMedicines);
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:medicineId', removeFromCart);
router.post('/cart/checkout', checkoutCart);

router.get('/labs', getLabTests);
router.post('/labs', bookLabTest);
router.get('/lab-bookings', getLabBookings);

router.get('/blood-requests', getBloodRequests);
router.post('/blood-requests', createBloodRequest);

module.exports = router;
