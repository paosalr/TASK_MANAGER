const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validar campos vacíos
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya esta en uso.' });
    }

    //Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    //Crear al usuario en Base de datos Firebase
    const userId = await User.create({ email, username, password: hashedPassword });

    res.status(201).json({ message: 'Usuario ya registrado', userId });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    //Token 
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
