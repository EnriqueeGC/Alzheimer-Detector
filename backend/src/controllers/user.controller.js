const prisma = require('../config/db');

// @desc    Obtener mi perfil (usuario logueado)
// @route   GET /api/users/me
const getMe = (req, res) => {
  // req.user viene del middleware de protección
  res.json(req.user);
};

// @desc    Obtener todos los usuarios 
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }, // Nunca devolver la contraseña
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Actualizar mi perfil
// @route   PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // req.user.id viene del middleware
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
      select: { id: true, name: true, email: true }
    });
    
    res.json(updatedUser);
  } catch (error) {
     res.status(500).json({ message: 'Error al actualizar', error: error.message });
  }
};

// @desc    Eliminar mi cuenta
// @route   DELETE /api/users/me
const deleteMe = async (req, res) => {
  try {
    await prisma.user.delete({
        where: { id: req.user.id }
    });
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar', error: error.message });
  }
};


module.exports = {
  getMe,
  getAllUsers,
  updateMe,
  deleteMe,
};