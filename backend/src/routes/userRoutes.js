const express = require('express');
const { getUsers } = require('../controllers/userController'); 
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', authenticate, getUsers);

module.exports = router;