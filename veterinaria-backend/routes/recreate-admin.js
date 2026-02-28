const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { runQuery, getQuery } = require('../config/database');

// Endpoint para eliminar y recrear el admin
router.post('/recreate-admin', async (req, res) => {
  try {
    console.log('🔧 Borrando admin existente...');
    
    // 1. Eliminar si existe
    await runQuery("DELETE FROM usuarios WHERE email = $1", ['admin@veterinaria.com']);
    
    // 2. Crear nuevo con rol admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const result = await runQuery(
      'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        'Administrador',
        'admin@veterinaria.com',
        hashedPassword,
        '+34-123-456-789',
        null,
        'admin'
      ]
    );
    
    console.log('✅ Admin recreado:', result.rows[0]);
    
    res.json({
      success: true,
      message: 'Admin recreado correctamente con rol=admin',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
