const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { runQuery, allQuery } = require('../config/database');

// Obtener historial médico de todas las mascotas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const historial = await allQuery(
      `SELECT h.*, m.nombre as mascota_nombre, m.tipo as mascota_tipo
       FROM historial_medico h
       JOIN mascotas m ON h.mascota_id = m.id
       WHERE m.usuario_id = $1
       ORDER BY h.fecha DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: historial,
    });
  } catch (error) {
    console.error('Error al obtener historial médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial médico',
      data: []
    });
  }
});

// Obtener historial médico de una mascota específica
router.get('/mascota/:mascotaId', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Buscando historial médico - Mascota ID:', req.params.mascotaId, 'Usuario ID:', req.user.id);
    
    // Verificar que la mascota pertenezca al usuario
    const mascota = await runQuery(
      'SELECT * FROM mascotas WHERE id = $1 AND usuario_id = $2',
      [req.params.mascotaId, req.user.id]
    );

    if (!mascota.rows || mascota.rows.length === 0) {
      console.log('❌ Mascota no encontrada o no pertenece al usuario');
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    console.log('✅ Mascota verificada:', mascota.rows[0].nombre);

    const historial = await allQuery(
      `SELECT h.*, m.nombre as mascota_nombre
       FROM historial_medico h
       JOIN mascotas m ON h.mascota_id = m.id
       WHERE h.mascota_id = $1
       ORDER BY h.fecha DESC`,
      [req.params.mascotaId]
    );

    console.log(`✅ ${historial.length} registros de historial encontrados para mascota ${req.params.mascotaId}`);
    if (historial.length > 0) {
      console.log('Historial:', historial.map(h => ({ id: h.id, fecha: h.fecha, tipo_servicio: h.tipo_servicio })));
    }

    res.json({
      success: true,
      data: historial,
    });
  } catch (error) {
    console.error('❌ Error al obtener historial de mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      data: []
    });
  }
});

// Crear registro en historial médico (solo admin)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden crear registros médicos',
    });
  }

  const {
    mascota_id,
    cita_id,
    fecha,
    tipo_servicio,
    descripcion,
    diagnostico,
    tratamiento,
    veterinario,
    costo
  } = req.body;

  if (!mascota_id || !fecha || !tipo_servicio) {
    return res.status(400).json({
      success: false,
      message: 'Los campos mascota_id, fecha y tipo_servicio son obligatorios',
    });
  }

  try {
    const result = await runQuery(
      `INSERT INTO historial_medico 
       (mascota_id, cita_id, fecha, tipo_servicio, descripcion, diagnostico, tratamiento, veterinario, costo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        mascota_id,
        cita_id || null,
        fecha,
        tipo_servicio,
        descripcion || null,
        diagnostico || null,
        tratamiento || null,
        veterinario || req.user.nombre,
        costo || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registro médico creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al crear registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro médico',
      error: error.message
    });
  }
});

// Actualizar registro en historial médico (solo admin)
router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden actualizar registros médicos',
    });
  }

  const { descripcion, diagnostico, tratamiento, costo } = req.body;

  try {
    const result = await runQuery(
      `UPDATE historial_medico
       SET descripcion = COALESCE($1, descripcion),
           diagnostico = COALESCE($2, diagnostico),
           tratamiento = COALESCE($3, tratamiento),
           costo = COALESCE($4, costo)
       WHERE id = $5
       RETURNING *`,
      [descripcion, diagnostico, tratamiento, costo, req.params.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro médico no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Registro médico actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar registro médico',
    });
  }
});

module.exports = router;
