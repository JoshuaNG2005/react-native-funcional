const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { runQuery, allQuery } = require('../config/database');

// Obtener todos los tratamientos de las mascotas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tratamientos = await allQuery(
      `SELECT t.*, m.nombre as mascota_nombre, m.tipo as mascota_tipo
       FROM tratamientos t
       JOIN mascotas m ON t.mascota_id = m.id
       WHERE m.usuario_id = ?
       ORDER BY t.fecha_inicio DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: tratamientos,
    });
  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tratamientos',
      data: []
    });
  }
});

// Obtener tratamientos de una mascota específica
router.get('/mascota/:mascotaId', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Buscando tratamientos - Mascota ID:', req.params.mascotaId, 'Usuario ID:', req.user.id);
    
    // Verificar que la mascota pertenezca al usuario
    let mascota;
    try {
      mascota = await runQuery(
        'SELECT * FROM mascotas WHERE id = ? AND usuario_id = ?',
        [req.params.mascotaId, req.user.id]
      );
    } catch (err) {
      console.log('Error verificando mascota:', err.message);
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    if (!mascota || mascota.length === 0) {
      console.log('❌ Mascota no encontrada o no pertenece al usuario');
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    console.log('✅ Mascota verificada:', mascota[0].nombre);

    const tratamientos = await allQuery(
      `SELECT t.*, m.nombre as mascota_nombre
       FROM tratamientos t
       JOIN mascotas m ON t.mascota_id = m.id
       WHERE t.mascota_id = ?
       ORDER BY t.fecha_inicio DESC`,
      [req.params.mascotaId]
    );

    console.log(`✅ ${tratamientos.length} tratamientos encontrados para mascota ${req.params.mascotaId}`);
    if (tratamientos.length > 0) {
      console.log('Tratamientos:', tratamientos.map(t => ({ id: t.id, nombre: t.nombre, estado: t.estado })));
    }

    res.json({
      success: true,
      data: tratamientos,
    });
  } catch (error) {
    console.error('❌ Error al obtener tratamientos de mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tratamientos',
      data: []
    });
  }
});

// Crear un nuevo tratamiento (solo admin)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden crear tratamientos',
    });
  }

  const {
    mascota_id,
    cita_id,
    nombre,
    descripcion,
    medicamento,
    dosis,
    frecuencia,
    duracion,
    fecha_inicio,
    fecha_fin,
    notas
  } = req.body;

  if (!mascota_id || !nombre || !fecha_inicio) {
    return res.status(400).json({
      success: false,
      message: 'Los campos mascota_id, nombre y fecha_inicio son obligatorios',
    });
  }

  try {
    const result = await runQuery(
      `INSERT INTO tratamientos 
       (mascota_id, cita_id, nombre, descripcion, medicamento, dosis, frecuencia, duracion, fecha_inicio, fecha_fin, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mascota_id,
        cita_id || null,
        nombre,
        descripcion || null,
        medicamento || null,
        dosis || null,
        frecuencia || null,
        duracion || null,
        fecha_inicio,
        fecha_fin || null,
        notas || null,
        'activo'
      ]
    );

    // Obtener el tratamiento creado
    const newTratamiento = await runQuery(
      'SELECT * FROM tratamientos WHERE id = LAST_INSERT_ID()',
      []
    );

    res.status(201).json({
      success: true,
      message: 'Tratamiento creado exitosamente',
      data: newTratamiento[0] || result,
    });
  } catch (error) {
    console.error('Error al crear tratamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tratamiento',
      error: error.message
    });
  }
});

// Actualizar un tratamiento (solo admin)
router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden actualizar tratamientos',
    });
  }

  const { estado, notas, fecha_fin } = req.body;

  try {
    // Construir query dinámicamente solo con los campos proporcionados
    let updateFields = [];
    let updateValues = [];

    if (estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }
    if (notas !== undefined) {
      updateFields.push('notas = ?');
      updateValues.push(notas);
    }
    if (fecha_fin !== undefined) {
      updateFields.push('fecha_fin = ?');
      updateValues.push(fecha_fin);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar',
      });
    }

    updateValues.push(req.params.id);

    await runQuery(
      `UPDATE tratamientos
       SET ${updateFields.join(', ')}
       WHERE id = ?`,
      updateValues
    );

    // Obtener el tratamiento actualizado
    const result = await runQuery(
      'SELECT * FROM tratamientos WHERE id = ?',
      [req.params.id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Tratamiento actualizado exitosamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tratamiento',
    });
  }
});

// Obtener tratamientos activos
router.get('/activos', authenticateToken, async (req, res) => {
  try {
    const tratamientos = await allQuery(
      `SELECT t.*, m.nombre as mascota_nombre, m.tipo as mascota_tipo
       FROM tratamientos t
       JOIN mascotas m ON t.mascota_id = m.id
       WHERE m.usuario_id = ? AND t.estado = 'activo'
       ORDER BY t.fecha_inicio DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: tratamientos,
    });
  } catch (error) {
    console.error('Error al obtener tratamientos activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tratamientos activos',
      data: []
    });
  }
});

module.exports = router;
