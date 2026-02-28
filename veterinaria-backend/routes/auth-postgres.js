const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery, allQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// REGISTRO DE NUEVO USUARIO
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y password son requeridos',
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await getQuery('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await runQuery(
      'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [nombre, email, hashedPassword, telefono || null, direccion || null, 'cliente']
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { id: result.rows[0].id, nombre, email },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos',
      });
    }

    // Buscar usuario
    const usuario = await getQuery('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    // Respuesta sin la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: usuarioSinPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});

// OBTENER PERFIL DEL USUARIO ACTUAL
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const usuario = await getQuery('SELECT id, nombre, email, telefono, direccion, rol, fecha_creacion FROM usuarios WHERE id = $1', [
      req.user.id,
    ]);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

// ACTUALIZAR PERFIL
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nombre, telefono, direccion, password } = req.body;
    const usuarioId = req.user.id;

    let updateQuery = 'UPDATE usuarios SET ';
    const params = [];
    let paramIndex = 1;

    if (nombre) {
      updateQuery += `nombre = $${paramIndex}, `;
      params.push(nombre);
      paramIndex++;
    }
    if (telefono) {
      updateQuery += `telefono = $${paramIndex}, `;
      params.push(telefono);
      paramIndex++;
    }
    if (direccion) {
      updateQuery += `direccion = $${paramIndex}, `;
      params.push(direccion);
      paramIndex++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `password = $${paramIndex}, `;
      params.push(hashedPassword);
      paramIndex++;
    }

    // Remover última coma
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = $${paramIndex}`;
    params.push(usuarioId);

    await runQuery(updateQuery, params);

    const usuarioActualizado = await getQuery('SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = $1', [
      usuarioId,
    ]);

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
});

module.exports = router;
