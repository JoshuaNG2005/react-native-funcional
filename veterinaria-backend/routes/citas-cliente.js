const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { runQuery, allQuery } = require('../config/database');

// Crear una cita para el usuario cliente
router.post('/', authenticateToken, async (req, res) => {
  const { mascotaId, fecha, hora, motivo } = req.body;
  if (!mascotaId || !fecha || !hora || !motivo) {
    return res.status(400).json({ success: false, message: 'mascotaId, fecha, hora y motivo son requeridos.' });
  }
  try {
    const fechaHora = `${fecha} ${hora}`;
    const result = await runQuery(
      'INSERT INTO citas (mascota_id, usuario_id, fecha_hora, motivo, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [mascotaId, req.user.id, fechaHora, motivo, 'programada']
    );
    res.status(201).json({ success: true, message: 'Cita creada correctamente.', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la cita.' });
  }
});

// Obtener todas las citas del usuario cliente
router.get('/', authenticateToken, async (req, res) => {
  try {
    const citas = await allQuery(
      'SELECT * FROM citas WHERE usuario_id = $1 ORDER BY fecha_hora DESC',
      [req.user.id]
    );
    res.json({ success: true, data: citas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener las citas.' });
  }
});

module.exports = router;
