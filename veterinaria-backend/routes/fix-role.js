const express = require('express');
const router = express.Router();
const { runQuery } = require('../config/database');

// Endpoint simple para actualizar rol admin
router.post('/update-admin-role', async (req, res) => {
  try {
    console.log('🔧 Actualizando rol de admin...');
    
    const result = await runQuery(
      "UPDATE usuarios SET rol = $1 WHERE email = $2 RETURNING *",
      ['admin', 'admin@veterinaria.com']
    );
    
    if (result && result.rowCount > 0) {
      console.log('✅ Rol actualizado correctamente');
      res.json({ 
        success: true, 
        message: 'Rol actualizado a admin',
        updated: result.rowCount
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
