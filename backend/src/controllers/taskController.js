const db = require('../config/firebase');

// Obtener todas las tareas del usuario autenticado
const getTasks = async (req, res) => {
  try {
    const { userId } = req.user; // Obtener el userId del token
    const tasksSnapshot = await db.collection('tasks').where('userId', '==', userId).get();

    if (tasksSnapshot.empty) {
      return res.status(200).json([]);
    }

    const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { userId } = req.user; // Obtener el userId del token

    if (!name) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const newTask = {
      name,
      description: description || '',
      userId, // Asociar la tarea al usuario autenticado
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const taskRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

// Actualizar tarea del usuario autenticado
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // Obtener el userId del token
    const updatedTask = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada.' });
    }

    await taskRef.update(updatedTask);
    res.status(200).json({ message: 'Tarea actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

// Eliminar tarea del usuario autenticado
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // Obtener el userId del token

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data().userId !== userId) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada.' });
    }

    await taskRef.delete();
    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
