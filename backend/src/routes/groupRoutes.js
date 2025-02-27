const express = require('express');
const { getGroups, createGroup } = require('../controllers/groupController'); 
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Obtener todos los grupos
router.get('/', authenticate, getGroups);

// Crear un nuevo grupo
router.post('/', authenticate, createGroup);

module.exports = router;
