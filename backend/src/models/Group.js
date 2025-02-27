const createGroup = async (req, res) => {
    try {
      const { name, description } = req.body;
      const { userId } = req.user;
      
      if (!name) {
        return res.status(400).json({ error: 'El nombre del grupo es obligatorio' });
      }
      
      const newGroup = {
        name,
        description,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };
  
      const groupRef = await db.collection('groups').add(newGroup);
      res.status(201).json({ id: groupRef.id, ...newGroup });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      res.status(500).json({ error: 'Error al crear grupo' });
    }
  };
  
  module.exports = { createGroup };