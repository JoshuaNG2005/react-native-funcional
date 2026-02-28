const express = require('express');
const { getQuery, allQuery } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// OBTENER ESTADÍSTICAS DEL DASHBOARD (Solo Admin)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Contar usuarios
    const usuariosResult = await getQuery('SELECT COUNT(*) as total FROM usuarios', []);
    const totalUsuarios = usuariosResult?.total || 0;

    // Contar citas totales
    const citasResult = await getQuery('SELECT COUNT(*) as total FROM citas', []);
    const totalCitas = citasResult?.total || 0;

    // Contar citas pendientes
    const citasPendientesResult = await getQuery(
      "SELECT COUNT(*) as total FROM citas WHERE estado = 'pendiente'",
      []
    );
    const citasPendientes = citasPendientesResult?.total || 0;

    res.json({
      success: true,
      data: {
        usuarios: totalUsuarios,
        citasTotales: totalCitas,
        citasPendientes: citasPendientes,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
    });
  }
});

module.exports = router;
