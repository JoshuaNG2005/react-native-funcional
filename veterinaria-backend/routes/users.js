const express = require('express');
const { allQuery, getQuery, runQuery } = require('../config/database');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// OBTENER TODOS LOS USUARIOS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const usuarios = await allQuery('SELECT id, nombre, email, telefono, direccion, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC', []);
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// ACTUALIZAR USUARIO (Solo Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, rol } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son obligatorios',
      });
    }

    // Verificar que el usuario existe
    const usuario = await getQuery('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar usuario
    await runQuery(
      'UPDATE usuarios SET nombre = $1, email = $2, telefono = $3, direccion = $4, rol = $5 WHERE id = $6',
      [nombre, email, telefono, direccion, rol || 'cliente', id]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: { id, nombre, email, telefono, direccion, rol },
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
    });
  }
});

// ELIMINAR USUARIO (Solo Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await getQuery('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // No permitir eliminar al propio admin que está autenticado
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta',
      });
    }

    // Eliminar usuario (las mascotas y citas se eliminan en cascada)
    await runQuery('DELETE FROM usuarios WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
    });
  }
});

module.exports = router;
