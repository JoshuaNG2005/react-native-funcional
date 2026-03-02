// Cargar variables de entorno SOLO en desarrollo local
// En Vercel, las variables se inyectan automáticamente
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { initDatabase, runQuery } = require('./config/database'); // Importamos ambos
const seedDatabase = require('./seed');

// Importar rutas (se mantienen igual)
const authRoutes = require('./routes/auth');
const mascotasRoutes = require('./routes/mascotas');
const citasRoutes = require('./routes/citas');
const fixRoleRoutes = require('./routes/fix-role');
const debugRoutes = require('./routes/debug');
const recreateAdminRoutes = require('./routes/recreate-admin');
const usersRoutes = require('./routes/users');
const adminStatsRoutes = require('./routes/admin-stats');
const citasClienteRoutes = require('./routes/citas-cliente');
const tratamientosRoutes = require('./routes/tratamientos');
const historialRoutes = require('./routes/historial');

const app = express();
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// 🔧 CORS - Configuración prioritaria ANTES de cualquier otro middleware
// Permitir explícitamente https://dist-tau-swart.vercel.app
const corsOptions = {
  origin: function (origin, callback) {
    // Lista blanca completa
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8082',
      'http://localhost:8083',
      'http://localhost:8084',
      'http://localhost:8085',
      'http://localhost:8086',
      'http://localhost:8087',
      'http://localhost:8090',
      'https://api-express-funcional.vercel.app',
      'https://api-express-mysql-de-jime.onrender.com',
      'https://veterinaria-admin.netlify.app',
      'https://veterinaria-web-final.vercel.app',
      'https://dist-tau-swart.vercel.app',
      'https://dist-ioomb1w2i-joshuas-projects-dd278c4a.vercel.app',
    ];

    // Patrones para dominios dinámicos
    const allowedPatterns = [
      /^https?:\/\/(.+\.)?localhost(:\d+)?$/,
      /^https:\/\/(.+\.)?vercel\.app$/,
      /^https:\/\/(.+\.)?netlify\.app$/,
      /^https:\/\/(.+\.)?onrender\.com$/,
    ];

    // Sin origen (requests desde localhost o misma página)
    if (!origin) {
      console.log('✅ CORS: Sin origen especificado (localhost o misma página)');
      return callback(null, true);
    }

    // Verificar lista blanca
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origen permitido (lista blanca): ${origin}`);
      return callback(null, true);
    }

    // Verificar patrones
    if (allowedPatterns.some((pattern) => pattern.test(origin))) {
      console.log(`✅ CORS: Origen permitido (patrón): ${origin}`);
      return callback(null, true);
    }

    console.error(`❌ CORS: Origen NO permitido: ${origin}`);
    return callback(new Error(`CORS error: Origen no permitido: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Aplicar CORS globalmente
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Veterinaria Backend activa',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      mascotas: '/api/v1/mascotas',
      citas: '/api/v1/citas',
    },
    frontend: 'https://dist-tau-swart.vercel.app',
  });
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/mascotas', mascotasRoutes);
app.use('/api/v1/citas', citasRoutes);
app.use('/api/v1/citas-cliente', citasClienteRoutes);
app.use('/api/v1/tratamientos', tratamientosRoutes);
app.use('/api/v1/historial', historialRoutes);
app.use('/api/v1/fix', fixRoleRoutes);
app.use('/api/v1/debug', debugRoutes);
app.use('/api/v1/admin', recreateAdminRoutes);
app.use('/api/v1/admin', adminStatsRoutes);
app.use('/api/v1/users', usersRoutes);

// Ruta de prueba - Actualizada para AWS/MySQL
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Backend ready - AWS RDS MySQL connected' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3001;

// ⚠️ VERIFICACIÓN CRÍTICA: Variables de entorno de base de datos
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌❌❌ VARIABLES DE ENTORNO FALTANTES ❌❌❌');
  console.error('Las siguientes variables NO están configuradas en Vercel:');
  missingEnvVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\n📋 SOLUCIÓN:');
  console.error('1. Ve a: https://vercel.com/joshuas-projects-dd278c4a/veterinaria-backend/settings/environment-variables');
  console.error('2. Añade las variables faltantes con sus valores');
  console.error('3. Haz Redeploy del proyecto\n');
  if (!isVercel) {
    throw new Error('Missing required environment variables: ' + missingEnvVars.join(', '));
  }
}

// Inicialización asíncrona
(async () => {
  if (isVercel) {
    console.log('ℹ️ [SERVER] Modo serverless (Vercel): no se usa app.listen');
    return;
  }

  try {
    console.log('🔄 [SERVER] Iniciando servidor...');
    console.log('🔄 [SERVER] NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('🔄 [SERVER] PORT:', PORT);
    
    console.log('🔄 [SERVER] Conectando a AWS RDS MySQL...');
    await initDatabase(); // Inicializa el pool
    
    console.log('🌱 [SERVER] Ejecutando seed de datos...');
    try {
      await seedDatabase();
    } catch (seedError) {
      console.error('⚠️ [SERVER] Error en seed (no crítico):', seedError.message);
      // No detenemos el servidor si falla el seed
    }
    
    // CORRECCIÓN: En MySQL se usa '?' en lugar de '$1'
    try {
      await runQuery(
        "UPDATE usuarios SET rol = ? WHERE email = ?", 
        ['admin', 'admin@veterinaria.com']
      );
      console.log('✅ [SERVER] Rol admin verificado en AWS');
    } catch (roleError) {
      console.error('⚠️ [SERVER] Error verificando rol admin:', roleError.message);
      // No crítico, continuamos
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📡 [SERVER] Conectado a AWS RDS: ${process.env.DB_HOST}`);
      console.log(`🏥 [SERVER] API de Veterinaria lista`);
      console.log(`🌐 [SERVER] CORS habilitado para: dist-tau-swart.vercel.app`);
    });
  } catch (error) {
    console.error('❌ [SERVER] Error fatal al iniciar servidor:');
    console.error('❌ [SERVER] Tipo:', error.name);
    console.error('❌ [SERVER] Mensaje:', error.message);
    console.error('❌ [SERVER] Código:', error.code);
    console.error('❌ [SERVER] Stack:', error.stack);
    
    // Sugerencias de diagnóstico
    if (error.message.includes('DB_')) {
      console.error('💡 [SERVER] Revisa las variables de entorno en Vercel:');
      console.error('   - DB_HOST');
      console.error('   - DB_USER');
      console.error('   - DB_PASSWORD');
      console.error('   - DB_NAME');
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('💡 [SERVER] Problema de conectividad con AWS RDS');
      console.error('   - Verifica que DB_HOST sea correcto');
      console.error('   - Verifica que el Security Group de AWS permita conexiones desde Vercel');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 [SERVER] Credenciales incorrectas');
      console.error('   - Verifica DB_USER y DB_PASSWORD');
    }
    
    if (!isVercel) {
      process.exit(1);
    }
  }
})();

module.exports = app;