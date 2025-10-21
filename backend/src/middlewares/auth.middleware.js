const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  // El token vendrá en el header 'Authorization' como 'Bearer <token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Obtener el token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscar al usuario y adjuntarlo a la request (sin el password)
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      next(); // Continuar a la siguiente función (el controlador)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };