const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { runQuery, allQuery } = require('../config/database');

// Función para obtener descripción detallada del tratamiento según el servicio
const obtenerDescripcionTratamiento = (tipoServicio) => {
  const descripciones = {
    'Vacunación': 'Aplicación de vacunas esenciales para prevenir enfermedades. Incluye: revisión previa del estado de salud, aplicación de vacuna, observación post-vacunación de 15 minutos, y registro en cartilla. Se recomienda mantener a la mascota en reposo el día de la aplicación.',
    'Consulta general': 'Revisión completa del estado de salud de su mascota. Incluye: examen físico general, evaluación de peso y temperatura, revisión de ojos, oídos y dientes, auscultación cardiopulmonar, y recomendaciones de cuidado. El veterinario responderá todas sus dudas.',
    'Desparasitación': 'Tratamiento para eliminar parásitos internos y externos. Incluye: evaluación del tipo de parásito, administración de antiparasitario oral o tópico según corresponda, recomendaciones de higiene, y plan de desparasitación preventiva. Importante ayuno de 2 horas previas.',
    'Baño y peluquería': 'Servicio completo de higiene y estética. Incluye: baño con productos especializados según tipo de pelaje, secado profesional, corte de uñas, limpieza de oídos, cepillado dental básico, y corte de pelo según preferencia. Tiempo estimado: 2-3 horas.',
    'Cirugía': 'Procedimiento quirúrgico programado. Incluye: exámenes preoperatorios, anestesia general controlada, cirugía realizada por veterinario especializado, recuperación post-operatoria en clínica, y seguimiento. Se requiere ayuno de 8-12 horas previas. Se entregarán indicaciones detalladas.',
    'Urgencia': 'Atención inmediata para casos críticos. Nuestro equipo evaluará rápidamente la condición de su mascota y tomará las medidas necesarias. Puede incluir: estabilización, medicación de emergencia, exámenes diagnósticos urgentes, y hospitalización si es necesario.',
    'Control': 'Seguimiento de tratamiento o condición previa. Incluye: evaluación de evolución, revisión de resultados de exámenes previos, ajuste de medicación si es necesario, y nuevas indicaciones. Traer cartilla médica y recetas anteriores.',
    'Análisis': 'Exámenes de laboratorio y diagnóstico. Puede incluir: análisis de sangre completo, química sanguínea, examen de orina, copro-parasitario, radiografías o ecografías según indicación. Resultados disponibles en 24-48 horas. Algunos exámenes requieren ayuno.',
    'Esterilización': 'Procedimiento quirúrgico de castración/esterilización. Incluye: evaluación preoperatoria, anestesia general, cirugía, hospitalización post-operatoria, medicación, y seguimiento. Ayuno obligatorio de 12 horas. Recuperación completa en 7-10 días. Se entregarán cuidados post-operatorios detallados.'
  };

  return descripciones[tipoServicio] || `Tratamiento programado para: ${tipoServicio}. El veterinario evaluará la condición de su mascota y proporcionará el tratamiento adecuado según sus necesidades específicas.`;
};

// Endpoint temporal para probar conexión a la base de datos (SIN autenticación)
router.get('/test-db', async (req, res) => {
  try {
    const result = await runQuery('SELECT NOW()');
    res.json({ success: true, message: 'Conexión exitosa', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de conexión', error: error.message });
  }
});

// Crear una nueva cita en la base de datos
router.post('/', authenticateToken, async (req, res) => {
  const mascotaId = req.body.mascotaId || req.body.mascota_id;
  const fecha = req.body.fecha;
  const hora = req.body.hora;
  const motivo = req.body.motivo || req.body.tipo_servicio;

  // Validar campos requeridos
  if (!mascotaId || !fecha || !hora || !motivo) {
    console.log('Validación falló. Datos recibidos:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Los campos mascotaId, fecha, hora y motivo son obligatorios.',
      received: req.body
    });
  }

  console.log('✅ Creando cita - Usuario:', req.user.id, 'Mascota:', mascotaId, 'Fecha:', fecha, 'Hora:', hora, 'Motivo:', motivo);

  try {
    // Insertar cita en la base de datos con los nombres correctos de las columnas
    // 🏥 Asignar médico por defecto (ID 1) si no se envía uno
    const result = await runQuery(
      'INSERT INTO citas (mascota_id, usuario_id, fecha, hora, tipo_servicio, estado, id_Medicos) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mascotaId, req.user.id, fecha, hora, motivo, 'pendiente', 1]
    );
    
    const citaCreada = { id: result.insertId, mascota_id: mascotaId, usuario_id: req.user.id, fecha, hora, tipo_servicio: motivo, estado: 'pendiente', id_Medicos: 1 };
    console.log('✅ Cita creada exitosamente:', citaCreada);
    
    // 🎯 CREAR TRATAMIENTO AUTOMÁTICAMENTE basado en el servicio de la cita
    try {
      const descripcionDetallada = obtenerDescripcionTratamiento(motivo);
      
      console.log('🔍 Creando tratamiento automático con datos:', {
        mascota_id: mascotaId,
        cita_id: citaCreada.id,
        nombre: motivo,
        estado: 'activo'
      });
      
      const tratamientoResult = await runQuery(
        `INSERT INTO tratamientos 
         (mascota_id, cita_id, nombre, descripcion, fecha_inicio, estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          mascotaId,
          citaCreada.id,
          motivo, // Nombre del tratamiento = servicio solicitado
          descripcionDetallada,
          fecha,
          'activo'
        ]
      );
      
      console.log('✅ Tratamiento creado automáticamente con ID:', tratamientoResult.insertId);
    } catch (tratError) {
      console.error('❌❌❌ ERROR AL CREAR TRATAMIENTO AUTOMÁTICO:', tratError);
      console.error('Stack:', tratError.stack);
      // No fallar la creación de la cita si el tratamiento falla
    }
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente.',
      data: citaCreada,
    });
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la cita.',
      error: error.message
    });
  }
});

// Obtener todas las citas de un usuario desde la base de datos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const citasUsuario = await allQuery(
      `SELECT 
        c.*, 
        m.nombre as mascota_nombre, m.tipo as mascota_tipo 
       FROM citas c 
       JOIN mascotas m ON c.mascota_id = m.id 
       WHERE c.usuario_id = ? 
       ORDER BY c.fecha DESC, c.hora DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: citasUsuario,
      citas: citasUsuario
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      data: []
    });
  }
});

// Obtener una cita específica desde la base de datos
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT 
        c.*, 
        m.nombre as mascota_nombre, m.tipo as mascota_tipo 
       FROM citas c 
       JOIN mascotas m ON c.mascota_id = m.id 
       WHERE c.id = ? AND c.usuario_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada.',
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cita',
    });
  }
});

// Cancelar una cita en la base de datos
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await runQuery(
      'UPDATE citas SET estado = ? WHERE id = ? AND usuario_id = ?',
      ['cancelada', req.params.id, req.user.id]
    );

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada.',
      });
    }

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente.',
      data: { id: req.params.id, estado: 'cancelada' }
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la cita',
    });
  }
});

// ========== ENDPOINTS PARA ADMINISTRADORES ==========

// Verificar si el usuario es admin
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores.',
    });
  }
  next();
};

// Obtener TODAS las citas (solo admin)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('📋 [ADMIN/ALL] Solicitando todas las citas');
    console.log('📋 [ADMIN/ALL] Usuario:', req.user.email, 'Rol:', req.user.rol);
    
    const todasCitas = await allQuery(
      `SELECT 
        c.*, 
        m.nombre as mascota_nombre,
        m.tipo as mascota_tipo,
        m.raza as mascota_raza,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.telefono as usuario_telefono
       FROM citas c
       JOIN mascotas m ON c.mascota_id = m.id
       JOIN usuarios u ON c.usuario_id = u.id
       ORDER BY c.fecha DESC, c.hora DESC`
    );

    console.log('📋 [ADMIN/ALL] Total citas encontradas:', todasCitas.length);
    
    res.json({
      success: true,
      data: todasCitas,
    });
  } catch (error) {
    console.error('❌ [ADMIN/ALL] Error al obtener todas las citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las citas',
      data: []
    });
  }
});

// Actualizar una cita (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { estado, costo, notas_admin, descripcion } = req.body;
  const citaId = req.params.id;

  console.log('🔄 Actualizando cita:', citaId, 'Datos:', { estado, costo, notas_admin, descripcion });

  try {
    // Obtener la cita actual antes de actualizarla
    const citaActual = await runQuery(
      'SELECT * FROM citas WHERE id = ?',
      [citaId]
    );

    if (!citaActual || citaActual.length === 0) {
      console.log('❌ Cita no encontrada:', citaId);
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    const cita = citaActual[0];
    console.log('📋 Estado actual:', cita.estado, '→ Nuevo estado:', estado);

    // Actualizar la cita
    const result = await runQuery(
      `UPDATE citas 
       SET estado = COALESCE(?, estado),
           costo = COALESCE(?, costo),
           notas_admin = COALESCE(?, notas_admin),
           descripcion = COALESCE(?, descripcion)
       WHERE id = ?`,
      [estado, costo, notas_admin, descripcion, citaId]
    );

    console.log('✅ Cita actualizada, filas afectadas:', result.affectedRows);

    // Si la cita se marca como "completada", crear registro en historial médico
    if (estado === 'completada' && cita.estado !== 'completada') {
      try {
        const historialResult = await runQuery(
          `INSERT INTO historial_medico 
           (mascota_id, cita_id, fecha, tipo_servicio, descripcion, veterinario, costo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            cita.mascota_id,
            citaId,
            cita.fecha,
            cita.tipo_servicio,
            notas_admin || descripcion || `Servicio: ${cita.tipo_servicio}`,
            req.user.nombre || 'Veterinario',
            costo || 0
          ]
        );
        console.log('✅ Registro creado en historial médico con ID:', historialResult.insertId);
      } catch (historialError) {
        console.error('❌ Error al crear historial médico:', historialError);
        // No fallar la actualización de la cita si el historial falla
      }
    }

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: { ...cita, estado, costo, notas_admin, descripcion },
    });
  } catch (error) {
    console.error('❌ Error al actualizar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cita',
      error: error.message
    });
  }
});

// Obtener horarios disponibles para una fecha específica
router.get('/disponibilidad/:fecha', authenticateToken, async (req, res) => {
  const { fecha } = req.params;

  try {
    // Obtener todas las citas para esa fecha
    const citasDelDia = await allQuery(
      'SELECT hora FROM citas WHERE fecha = ? AND estado != ?',
      [fecha, 'cancelada']
    );

    // Horarios de trabajo: 8:00 AM - 8:00 PM, cada 30 minutos
    const horariosDisponibles = [];
    for (let hora = 8; hora <= 20; hora++) {
      for (let minuto of [0, 30]) {
        if (hora === 20 && minuto === 30) break; // Última cita a las 8:00 PM
        const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        // Verificar si este horario ya está ocupado
        const ocupado = citasDelDia.some(cita => {
          const horaDB = cita.hora.substring(0, 5); // Obtener HH:MM de la hora en la BD
          return horaDB === horario;
        });
        
        horariosDisponibles.push({
          hora: horario,
          disponible: !ocupado
        });
      }
    }

    res.json({
      success: true,
      fecha,
      horarios: horariosDisponibles,
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad',
      error: error.message
    });
  }
});

module.exports = router;
