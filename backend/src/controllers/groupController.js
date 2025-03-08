const db = require('../config/firebase');

// Obtener todos los grupos
const getGroups = async (req, res) => {
  try {
    const groupsSnapshot = await db.collection('groups').get();
    const groups = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
};

//Crear un nuevo grupo
const createGroup = async (req, res) => {
    try {
      const { name, description, members } = req.body;
      const { userId } = req.user;
      
      if (!name) {
        return res.status(400).json({ error: 'El nombre del grupo es obligatorio' });
      }
      
      const newGroup = {
        name,
        description: description || '',
        createdBy: userId,
        members: members || [], 
        createdAt: new Date().toISOString(),
      };
  
      const groupRef = await db.collection('groups').add(newGroup);
      res.status(201).json({ id: groupRef.id, ...newGroup });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      res.status(500).json({ error: 'Error al crear grupo' });
    }
};

module.exports = { getGroups, createGroup };
