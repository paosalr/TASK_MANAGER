const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/login', authController.login);
router.post('/change-role', authenticate, authController.changeRole);

module.exports = router;