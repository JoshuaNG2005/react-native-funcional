const jwt = require('jsonwebtoken');

// Cargar dotenv solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    if (user.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo administradores' });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
};
