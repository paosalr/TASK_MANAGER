const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contiene `userId` u otros datos del token
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = authenticate;
