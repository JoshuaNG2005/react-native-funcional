const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery, allQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Cargar dotenv solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const router = express.Router();

// ENDPOINT DE EMERGENCIA: Crear admin directo
router.post('/create-admin-direct', async (req, res) => {
  try {
    // Eliminar si existe
    await runQuery("DELETE FROM usuarios WHERE email = ?", ['adminveterinaria@admin.com']);
    
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    const result = await runQuery(
      'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)',
      ['Admin Sistema', 'adminveterinaria@admin.com', hashedPassword, '+34-999-999-999', 'Sistema', 'admin']
    );
    
    console.log('✅ Admin creado:', result);
    
    res.json({
      success: true,
      message: 'Admin creado con éxito',
      email: 'adminveterinaria@admin.com',
      password: 'admin123456',
      rol: 'admin',
      user: { id: result.insertId, email: 'adminveterinaria@admin.com', rol: 'admin' }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// REGISTRO DE NUEVO USUARIO
router.post('/register', async (req, res) => {
  try {
    console.log('POST /register body:', req.body);
    const { nombre, email, password, telefono, direccion, rol } = req.body;
    const userRole = rol || 'cliente'; // Por defecto es cliente
    
    // Obtener el usuario autenticado si existe
    const token = req.headers.authorization?.split(' ')[1];
    let userAuth = null;
    if (token) {
      try {
        userAuth = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
      } catch (e) {
        console.log('Token inválido, registro sin autenticación');
      }
    }

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y password son requeridos',
      });
    }

    // Si intenta crear un admin, debe estar autenticado como admin
    if (userRole === 'admin' && (!userAuth || userAuth.rol !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden crear otros administradores',
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await getQuery('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await runQuery(
      'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, telefono || null, direccion || null, userRole]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { id: result.insertId, nombre, email, rol: userRole },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 [LOGIN] Intento de login iniciado');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('⚠️ [LOGIN] Email o password faltante');
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos',
      });
    }

    console.log('🔍 [LOGIN] Buscando usuario:', email);
    
    // Buscar usuario con manejo de errores específico
    let usuario;
    try {
      usuario = await getQuery('SELECT * FROM usuarios WHERE email = ?', [email]);
    } catch (dbError) {
      console.error('❌ [LOGIN] Error de base de datos al buscar usuario:');
      console.error('❌ [LOGIN] Mensaje:', dbError.message);
      console.error('❌ [LOGIN] Código:', dbError.code);
      console.error('❌ [LOGIN] SQL State:', dbError.sqlState);
      console.error('❌ [LOGIN] Stack:', dbError.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de conexión con la base de datos',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    if (!usuario) {
      console.log('⚠️ [LOGIN] Usuario no encontrado:', email);
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    console.log('✅ [LOGIN] Usuario encontrado:', email, 'Rol:', usuario.rol);

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      console.log('⚠️ [LOGIN] Contraseña inválida para:', email);
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // 🔧 HOTFIX: Forzar rol admin para admin@veterinaria.com
    if (usuario.email === 'admin@veterinaria.com') {
      usuario.rol = 'admin';
      console.log('🔧 [LOGIN] Rol forzado a admin para:', email);
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    console.log('✅ [LOGIN] Token generado exitosamente para:', email);

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
    console.log('✅ [LOGIN] Login completado exitosamente para:', email);
  } catch (error) {
    console.error('❌ [LOGIN] Error inesperado en login:');
    console.error('❌ [LOGIN] Tipo:', error.name);
    console.error('❌ [LOGIN] Mensaje:', error.message);
    console.error('❌ [LOGIN] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// OBTENER PERFIL DEL USUARIO ACTUAL
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const usuario = await getQuery('SELECT id, nombre, email, telefono, direccion, rol, fecha_creacion FROM usuarios WHERE id = ?', [
      req.user.id,
    ]);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 🔧 HOTFIX: Forzar rol admin para admin@veterinaria.com
    if (usuario.email === 'admin@veterinaria.com') {
      usuario.rol = 'admin';
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

    if (nombre) {
      updateQuery += `nombre = ?, `;
      params.push(nombre);
    }
    if (telefono) {
      updateQuery += `telefono = ?, `;
      params.push(telefono);
    }
    if (direccion) {
      updateQuery += `direccion = ?, `;
      params.push(direccion);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `password = ?, `;
      params.push(hashedPassword);
    }

    // Remover última coma
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = ?`;
    params.push(usuarioId);

    await runQuery(updateQuery, params);

    const usuarioActualizado = await getQuery('SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = ?', [
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
