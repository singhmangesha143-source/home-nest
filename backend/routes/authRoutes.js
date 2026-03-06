const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, saveRoom, getAllUsers, deleteUser } = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');

// Auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// User routes (protected)
router.get('/users/profile', auth, getProfile);
router.put('/users/update', auth, updateProfile);
router.post('/users/save-room', auth, saveRoom);

// Admin user management
router.get('/users', auth, adminOnly, getAllUsers);
router.delete('/users/:id', auth, adminOnly, deleteUser);

module.exports = router;
