const express = require('express');
const authController = require('../controllers/authController');
console.log(authController);

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/login', authController.login);

module.exports = router;