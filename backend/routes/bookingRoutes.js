const express = require('express');
const router = express.Router();
const {
  createBooking, getUserBookings, updateBookingStatus, cancelBooking, getAllBookings,
} = require('../controllers/bookingController');
const { auth, adminOnly } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validate');

router.post('/book-room', auth, bookingValidation, createBooking);
router.get('/bookings', auth, getUserBookings);
router.put('/bookings/:id', auth, updateBookingStatus);
router.delete('/bookings/:id', auth, cancelBooking);

// Admin
router.get('/bookings/all', auth, adminOnly, getAllBookings);

module.exports = router;
