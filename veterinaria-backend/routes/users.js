const express = require('express');
const bcrypt = require('bcryptjs');
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
    let usuario;
    try {
      usuario = await getQuery('SELECT * FROM usuarios WHERE id = ?', [id]);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar usuario
    await runQuery(
      'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, direccion = ?, rol = ? WHERE id = ?',
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

// CAMBIAR CONTRASEÑA (Usuario autenticado)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validación
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Obtener usuario actual
    let usuario;
    try {
      usuario = await getQuery('SELECT * FROM usuarios WHERE id = ?', [userId]);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await runQuery(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
    });
  }
});

// ELIMINAR USUARIO (Solo Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    let usuario;
    try {
      usuario = await getQuery('SELECT * FROM usuarios WHERE id = ?', [id]);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

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
    await runQuery('DELETE FROM usuarios WHERE id = ?', [id]);

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
