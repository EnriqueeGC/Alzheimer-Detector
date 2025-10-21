const express = require('express');
const router = express.Router();
const { getMe, getAllUsers, updateMe, deleteMe } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);
router.get('/', protect, getAllUsers);

module.exports = router;