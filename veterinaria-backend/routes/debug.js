const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

// Endpoint para debuggear y arreglar el rol
router.get('/debug', async (req, res) => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    
    // 1. Consultar estado actual
    const before = await client.query(
      'SELECT id, email, rol FROM usuarios WHERE email = $1',
      ['admin@veterinaria.com']
    );
    
    console.log('📊 Estado ANTES:', before.rows[0]);
    
    // 2. Actualizar
    const update = await client.query(
      "UPDATE usuarios SET rol = $1 WHERE email = $2 RETURNING *",
      ['admin', 'admin@veterinaria.com']
    );
    
    console.log('✅ UPDATE ejecutado, filas afectadas:', update.rowCount);
    
    // 3. Consultar estado después
    const after = await client.query(
      'SELECT id, email, rol FROM usuarios WHERE email = $1',
      ['admin@veterinaria.com']
    );
    
    console.log('📊 Estado DESPUÉS:', after.rows[0]);
    
    client.release();
    
    res.json({
      success: true,
      before: before.rows[0],
      updated: update.rowCount,
      after: after.rows[0]
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
