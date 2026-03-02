const express = require('express');
const { getQuery, runQuery, allQuery } = require('../config/database');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// ADMIN: OBTENER TODAS LAS MASCOTAS DE TODOS LOS USUARIOS
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const mascotas = await allQuery(`
      SELECT m.*, u.nombre as usuario_nombre, u.email as usuario_email 
      FROM mascotas m 
      LEFT JOIN usuarios u ON m.usuario_id = u.id 
      ORDER BY m.fecha_creacion DESC
    `);

    res.json({ success: true, data: mascotas });
  } catch (error) {
    console.error('Error al obtener todas las mascotas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mascotas' });
  }
});

// OBTENER TODAS LAS MASCOTAS DEL USUARIO
router.get('/', authenticateToken, async (req, res) => {
  try {
    const mascotas = await allQuery('SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY id DESC', [
      req.user.id,
    ]);

    res.json({ success: true, data: mascotas });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mascotas' });
  }
});

// CREAR NUEVA MASCOTA
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, tipo, raza, edad, peso, color } = req.body;

    console.log('POST /mascotas - Usuario:', req.user.id);
    console.log('Datos recibidos:', { nombre, tipo, raza, edad, peso, color });

    if (!nombre || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y tipo de mascota son requeridos',
      });
    }

    const result = await runQuery(
      'INSERT INTO mascotas (nombre, tipo, raza, edad, peso, color, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, tipo, raza || null, edad || null, peso || null, color || null, req.user.id]
    );

    console.log('Mascota creada exitosamente, ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: { id: result.insertId, nombre, tipo, raza, edad, peso, color, usuario_id: req.user.id },
    });
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear mascota en el servidor',
      error: error.message 
    });
  }
});

// OBTENER MASCOTA POR ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mascota = await getQuery('SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);

    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    res.json({ success: true, data: mascota });
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mascota' });
  }
});

// ACTUALIZAR MASCOTA
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { nombre, tipo, raza, edad, peso, color } = req.body;
    const mascotaId = req.params.id;

    // Verificar que la mascota pertenece al usuario
    const mascota = await getQuery('SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?', [mascotaId, req.user.id]);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    const updateQuery = `
      UPDATE mascotas 
      SET nombre = ?, tipo = ?, raza = ?, edad = ?, peso = ?, color = ?
      WHERE id = ? AND usuario_id = ?
    `;

    await runQuery(updateQuery, [
      nombre || mascota.nombre, 
      tipo || mascota.tipo, 
      raza || mascota.raza, 
      edad || mascota.edad, 
      peso || mascota.peso, 
      color || mascota.color,
      mascotaId, 
      req.user.id
    ]);

    res.json({
      success: true,
      message: 'Mascota actualizada',
      data: { id: mascotaId, nombre, tipo, raza, edad, peso, color },
    });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar mascota' });
  }
});

// ELIMINAR MASCOTA
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mascotaId = req.params.id;

    // Verificar que la mascota pertenece al usuario
    const mascota = await getQuery('SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?', [mascotaId, req.user.id]);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    await runQuery('DELETE FROM mascotas WHERE id = ? AND usuario_id = ?', [mascotaId, req.user.id]);

    res.json({ success: true, message: 'Mascota eliminada' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar mascota' });
  }
});

// OBTENER HISTORIAL MÉDICO DE UNA MASCOTA
router.get('/:id/historial', authenticateToken, async (req, res) => {
  try {
    const mascotaId = req.params.id;

    // Verificar que la mascota pertenece al usuario
    const mascota = await getQuery('SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?', [mascotaId, req.user.id]);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    // Obtener historial médico (citas)
    const historial = await allQuery(`
      SELECT 
        id, 
        DATE_FORMAT(CONCAT(fecha, ' ', hora), '%d/%m/%Y %H:%i') as fecha,
        'Consulta' as tipo,
        COALESCE(tipo_servicio, 'Sin descripción') as descripcion,
        estado
      FROM citas 
      WHERE mascota_id = ? AND estado = 'completada'
      ORDER BY fecha DESC, hora DESC
    `, [mascotaId]);

    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial médico' });
  }
});

// OBTENER TRATAMIENTOS DE UNA MASCOTA
router.get('/:id/tratamientos', authenticateToken, async (req, res) => {
  try {
    const mascotaId = req.params.id;

    // Verificar que la mascota pertenece al usuario
    const mascota = await getQuery('SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?', [mascotaId, req.user.id]);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    // Obtener tratamientos activos (basados en citas programadas/en proceso)
    const tratamientos = await allQuery(`
      SELECT 
        id,
        DATE_FORMAT(fecha, '%d/%m/%Y') as fecha_inicio,
        NULL as fecha_fin,
        'Tratamiento' as tipo,
        COALESCE(tipo_servicio, 'Tratamiento general') as descripcion,
        COALESCE(descripcion, 'Sin especificar') as medicamento,
        'Según prescripción' as dosis
      FROM citas 
      WHERE mascota_id = ? AND estado IN ('programada', 'en_proceso', 'pendiente')
      ORDER BY fecha DESC, hora DESC
    `, [mascotaId]);

    res.json({ success: true, data: tratamientos });
  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tratamientos' });
  }
});

module.exports = router;
