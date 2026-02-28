const mysql = require('mysql2/promise');
const { Client } = require('pg');
require('dotenv').config();

const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'usuarios_db'
};

const NEON_CONNECTION = process.env.DATABASE_URL;

async function migrateFromMySQLToNeon() {
  console.log('\n🚀 Iniciando migración de MySQL a Neon PostgreSQL...\n');

  // Conectar a MySQL
  let mysqlConnection;
  try {
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conectado a MySQL local');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.log('\n⚠️  Asegúrate de que MySQL esté corriendo en localhost:3306');
    process.exit(1);
  }

  // Conectar a PostgreSQL (Neon)
  const pgClient = new Client({ connectionString: NEON_CONNECTION });
  await pgClient.connect();
  console.log('✅ Conectado a Neon PostgreSQL');

  // Crear tablas en PostgreSQL
  console.log('\n📊 Creando tablas en Neon...');
  
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      telefono VARCHAR(20),
      direccion VARCHAR(255),
      rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
      estado VARCHAR(50) DEFAULT 'activo',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✅ Tabla usuarios creada');

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS mascotas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      raza VARCHAR(100),
      edad INT,
      peso DECIMAL(5, 2),
      usuario_id INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
  console.log('  ✅ Tabla mascotas creada');

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS citas (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL,
      mascota_id INT NOT NULL,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      tipo_servicio VARCHAR(255) NOT NULL,
      descripcion TEXT,
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
      costo DECIMAL(10, 2),
      notas_admin TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
    )
  `);
  console.log('  ✅ Tabla citas creada');

  // Exportar usuarios
  console.log('\n📦 Exportando datos de MySQL...');
  
  // Intentar diferentes nombres de tabla
  let usuarios = [];
  try {
    [usuarios] = await mysqlConnection.execute('SELECT * FROM usuarios');
  } catch (error) {
    try {
      [usuarios] = await mysqlConnection.execute('SELECT * FROM users');
    } catch (error2) {
      console.log('  ⚠️  Buscando tablas disponibles...');
      const [tables] = await mysqlConnection.execute('SHOW TABLES');
      console.log('  📋 Tablas encontradas:', tables);
      throw new Error('No se encontró tabla de usuarios');
    }
  }
  console.log(`  📋 Encontrados ${usuarios.length} usuarios`);

  // Limpiar tabla de usuarios en Neon (opcional, comenta si quieres mantener los existentes)
  await pgClient.query('TRUNCATE TABLE usuarios CASCADE');
  console.log('  🗑️  Tabla usuarios limpiada');

  for (const usuario of usuarios) {
    try {
      await pgClient.query(
        'INSERT INTO usuarios (id, nombre, email, password, telefono, direccion, rol, estado, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          usuario.id,
          usuario.nombre,
          usuario.email,
          usuario.password,
          usuario.telefono,
          usuario.direccion,
          usuario.rol,
          usuario.estado || 'activo',
          usuario.fecha_creacion
        ]
      );
      console.log(`    ✅ ${usuario.email}`);
    } catch (error) {
      console.error(`    ❌ Error con ${usuario.email}:`, error.message);
    }
  }
  console.log(`  ✅ ${usuarios.length} usuarios migrados`);

  // Exportar mascotas
  try {
    const [mascotas] = await mysqlConnection.execute('SELECT * FROM mascotas');
    console.log(`  📋 Encontradas ${mascotas.length} mascotas`);

    for (const mascota of mascotas) {
      await pgClient.query(
        'INSERT INTO mascotas (id, nombre, tipo, raza, edad, peso, usuario_id, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          mascota.id,
          mascota.nombre,
          mascota.tipo,
          mascota.raza,
          mascota.edad,
          mascota.peso,
          mascota.usuario_id,
          mascota.fecha_creacion
        ]
      );
    }
    console.log(`  ✅ ${mascotas.length} mascotas migradas`);
  } catch (error) {
    console.log('  ℹ️  No hay mascotas o tabla no existe');
  }

  // Exportar citas
  try {
    const [citas] = await mysqlConnection.execute('SELECT * FROM citas');
    console.log(`  📋 Encontradas ${citas.length} citas`);

    for (const cita of citas) {
      await pgClient.query(
        'INSERT INTO citas (id, usuario_id, mascota_id, fecha, hora, tipo_servicio, descripcion, estado, costo, notas_admin, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          cita.id,
          cita.usuario_id,
          cita.mascota_id,
          cita.fecha,
          cita.hora,
          cita.tipo_servicio,
          cita.descripcion,
          cita.estado,
          cita.costo,
          cita.notas_admin,
          cita.fecha_creacion
        ]
      );
    }
    console.log(`  ✅ ${citas.length} citas migradas`);
  } catch (error) {
    console.log('  ℹ️  No hay citas o tabla no existe');
  }

  // Resetear secuencias de PostgreSQL
  await pgClient.query(`SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios))`);
  await pgClient.query(`SELECT setval('mascotas_id_seq', COALESCE((SELECT MAX(id) FROM mascotas), 1))`);
  await pgClient.query(`SELECT setval('citas_id_seq', COALESCE((SELECT MAX(id) FROM citas), 1))`);

  await mysqlConnection.end();
  await pgClient.end();

  console.log('\n✨ ¡Migración completada exitosamente!\n');
  console.log('🔍 Verifica tus datos en: https://console.neon.tech\n');
}

migrateFromMySQLToNeon().catch(error => {
  console.error('❌ Error en la migración:', error.message);
  process.exit(1);
});
