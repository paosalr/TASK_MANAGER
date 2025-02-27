const db = require('../config/firebase');

// Obtener todas las tareas del usuario autenticado
const getTasks = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let tasks = [];

    if (role === 'employee') {
      // Consulta 1: Tareas individuales asignadas al empleado
      const individualTasksSnapshot = await db.collection('tasks')
        .where('assignedTo', '==', userId)
        .where('taskType', '==', 'individual')
        .get();

      // Consulta 2: Tareas grupales donde el empleado está en el grupo
      const groupTasksSnapshot = await db.collection('tasks')
        .where('taskType', '==', 'grupal')
        .get();

        //Array y filtrar
        const groupTasks = groupTasksSnapshot.docs
        .map((doc) => {
          const taskData = doc.data();
          // Convertir assignedTo a array si es una cadena
          const assignedToArray = typeof taskData.assignedTo === 'string' 
            ? [taskData.assignedTo] 
            : taskData.assignedTo;
          return { id: doc.id, ...taskData, assignedTo: assignedToArray };
        })
        .filter((task) => task.assignedTo.includes(userId)); // Filtrar por userId

      // Combinar los resultados de ambas consultas
      const individualTasks = individualTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      tasks = [...individualTasks, ...groupTasks];
    } else {
      // Admin y Master pueden ver todas las tareas
      const tasksSnapshot = await db.collection('tasks').get();
      tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    console.log("Tareas encontradas:", tasks); // Depuración: Verifica las tareas encontradas
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { name, description, groupId, status, category, assignedTo, taskType } = req.body;
    const { userId, role } = req.user;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    // Validar si es una tarea grupal y si el usuario tiene permisos para crearla
    if (taskType === 'grupal' && (role !== 'admin' && role !== 'master')) {
      return res.status(403).json({ error: 'No tienes permiso para crear tareas grupales' });
    }

    const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    const newTask = {
      name,
      description: description || '',
      userId,
      groupId: groupId || null,
      assignedTo: taskType === 'grupal' ? assignedTo : [userId],
      taskType: taskType || 'individual', 
      timeUntilFinish: new Date().toISOString(),
      status: status || 'En progreso',
      category: category || '',
      createdAt: new Date().toISOString(),
    };

    const taskRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea', details: error.message });
  }
};

// Actualizar tarea del usuario autenticado
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const updatedTask = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const taskData = taskDoc.data();

    if (role === 'employee') {
      // Empleados pueden editar todas las tareas individuales
      if (taskData.taskType === 'individual' && taskData.assignedTo === userId) {
        await taskRef.update(updatedTask); // Pueden editar todos los campos
      }
      // Empleados solo pueden editar el estado de las tareas grupales
      else if (taskData.taskType === 'grupal' && taskData.assignedTo.includes(userId)) {
        await taskRef.update({ status: updatedTask.status }); // Solo pueden editar el estado
      } else {
        return res.status(403).json({ error: 'No tienes permiso para editar esta tarea.' });
      }
    } else if (role === 'admin' || role === 'master') {
      // Admin y Master pueden editar todas las tareas sin restricciones
      await taskRef.update(updatedTask);
    } else {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea.' });
    }

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
    const { userId, role } = req.user;

    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const taskData = taskDoc.data();

    // Solo el creador de la tarea o un admin/master pueden eliminarla
    if (taskData.userId !== userId && role !== 'admin' && role !== 'master') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea.' });
    }

    await taskRef.delete();
    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };