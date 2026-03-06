const express = require('express');
const router = express.Router();
const {
  getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom,
  addReview, searchRooms, getRecommendations,
} = require('../controllers/roomController');
const { auth, adminOnly } = require('../middleware/auth');
const { roomValidation } = require('../middleware/validate');

// Public routes
router.get('/rooms', getAllRooms);
router.get('/rooms/search', searchRooms);
router.get('/rooms/recommendations', getRecommendations);
router.get('/rooms/:id', getRoomById);

// Protected routes
router.post('/rooms', auth, adminOnly, roomValidation, createRoom);
router.put('/rooms/:id', auth, adminOnly, updateRoom);
router.delete('/rooms/:id', auth, adminOnly, deleteRoom);

// Reviews
router.post('/rooms/:id/reviews', auth, addReview);

module.exports = router;
