const express = require('express');
const router = express.Router();
const { getAllLandlords, createLandlord, verifyLandlord, deleteLandlord } = require('../controllers/landlordController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/landlords', getAllLandlords);
router.post('/landlords', auth, adminOnly, createLandlord);
router.put('/landlords/:id/verify', auth, adminOnly, verifyLandlord);
router.delete('/landlords/:id', auth, adminOnly, deleteLandlord);

module.exports = router;
