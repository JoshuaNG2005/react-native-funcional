const mysql = require('mysql2/promise');

// Cargar dotenv solo en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

let pool = null;

const initDatabase = async () => {
  try {
    if (pool) return pool; // Evita crear múltiples pools si se llama dos veces

    // 🔍 Logging de variables de entorno para diagnóstico
    console.log('🔍 [DB CONFIG] Iniciando conexión a MySQL...');
    console.log('🔍 [DB CONFIG] DB_HOST:', process.env.DB_HOST ? '✅ Configurado' : '❌ FALTA');
    console.log('🔍 [DB CONFIG] DB_USER:', process.env.DB_USER ? '✅ Configurado' : '❌ FALTA');
    console.log('🔍 [DB CONFIG] DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Configurado' : '❌ FALTA');
    console.log('🔍 [DB CONFIG] DB_NAME:', process.env.DB_NAME ? '✅ Configurado' : '❌ FALTA');
    console.log('🔍 [DB CONFIG] DB_PORT:', process.env.DB_PORT || '3306 (default)');

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error('❌ Variables de entorno de base de datos incompletas. Verifica DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en Vercel.');
    }

    // Configuración SSL para AWS RDS
    const sslConfig = process.env.DB_SSL === 'false' 
      ? false 
      : {
          rejectUnauthorized: false // Necesario para Vercel + AWS RDS
        };

    console.log('🔍 [DB CONFIG] SSL:', sslConfig ? 'Habilitado (rejectUnauthorized: false)' : 'Deshabilitado');

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: process.env.DB_TIMEOUT ? parseInt(process.env.DB_TIMEOUT) : 60000,
      enableKeepAlive: true 
    });

    const connection = await pool.getConnection();
    console.log('✅ [DB CONFIG] Conectado a MySQL en AWS exitosamente');
    console.log('✅ [DB CONFIG] Host:', process.env.DB_HOST);
    console.log('✅ [DB CONFIG] Base de datos:', process.env.DB_NAME);
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ [DB CONFIG] Error al conectar a MySQL:');
    console.error('❌ [DB CONFIG] Mensaje:', error.message);
    console.error('❌ [DB CONFIG] Código:', error.code);
    console.error('❌ [DB CONFIG] Stack:', error.stack);
    
    // Diagnóstico específico para errores comunes
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 [DB CONFIG] La base de datos rechazó la conexión');
      console.error('   - Verifica que DB_HOST y DB_PORT sean correctos');
      console.error('   - Verifica que la base de datos esté activa');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 [DB CONFIG] Credenciales incorrectas');
      console.error('   - Verifica DB_USER y DB_PASSWORD en Vercel');
    }
    
    if (error.message.includes('SSL') || error.message.includes('handshake')) {
      console.error('💡 [DB CONFIG] Error de SSL/Handshake');
      console.error('   - Intenta agregar variable DB_SSL=false en Vercel');
      console.error('   - O verifica la configuración SSL de AWS RDS');
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('💡 [DB CONFIG] Timeout o host no encontrado');
      console.error('   - Verifica que DB_HOST sea accesible desde Vercel');
      console.error('   - Verifica Security Groups de AWS RDS');
    }
    
    throw error;
  }
};

const runQuery = async (query, params = []) => {
  try {
    // SEGURIDAD: Si por alguna razón el pool no se inició, lo intenta iniciar aquí
    if (!pool) {
      console.log('⚠️ [DB QUERY] Pool no inicializado, inicializando...');
      await initDatabase();
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ [DB QUERY] Error ejecutando query:');
    console.error('❌ [DB QUERY] Query:', query);
    console.error('❌ [DB QUERY] Params:', params);
    console.error('❌ [DB QUERY] Error:', error.message);
    console.error('❌ [DB QUERY] Código:', error.code);
    throw error;
  }
};

// Función auxiliar para obtener un solo registro (primera fila)
const getQuery = async (query, params = []) => {
  const rows = await runQuery(query, params);
  return rows.length > 0 ? rows[0] : null;
};

// Función auxiliar para obtener todos los registros (alias de runQuery)
const allQuery = async (query, params = []) => {
  return await runQuery(query, params);
};

module.exports = {
  initDatabase,
  runQuery,
  getQuery,
  allQuery,
};