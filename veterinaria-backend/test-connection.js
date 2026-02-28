const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL...\n');
  console.log('Configuración:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log();

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    
    console.log('✅ Conexión exitosa a MySQL!');
    console.log(`   Resultado de test: 1 + 1 = ${rows[0].result}`);
    
    connection.release();
    pool.end();
    process.exit(0);
  } catch (error) {
    console.log('❌ Error al conectar a MySQL:');
    console.log(`   ${error.message}`);
    console.log('\n📋 Soluciones:');
    console.log('  1. Verifica que MySQL Server está corriendo');
    console.log('  2. Verifica las credenciales en .env');
    console.log('  3. Verifica que la base de datos usuarios_db existe');
    console.log('\n📖 Lee SETUP_MYSQL.md para más ayuda');
    process.exit(1);
  }
}

testConnection();
