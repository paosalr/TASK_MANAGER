const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, updateSubtaskStatus } = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);
router.put('/:id/update-subtask', authenticate, updateSubtaskStatus);

module.exports = router;
