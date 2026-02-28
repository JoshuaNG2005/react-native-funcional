const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const NEON_CONNECTION = 'postgresql://neondb_owner:npg_24ygwNfLnoCU@ep-snowy-mouse-ai2qasyt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function migrateToNeon() {
  console.log('\n🚀 Iniciando migración a Neon PostgreSQL...\n');

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

  // Verificar si SQLite existe
  const fs = require('fs');
  const sqliteExists = fs.existsSync('./database.sqlite');

  if (sqliteExists) {
    console.log('\n📦 Exportando datos de SQLite...');
    
    const db = new sqlite3.Database('./database.sqlite');

    // Exportar usuarios
    const usuarios = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    for (const usuario of usuarios) {
      await pgClient.query(
        'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING',
        [usuario.nombre, usuario.email, usuario.password, usuario.telefono, usuario.direccion, usuario.rol, usuario.estado || 'activo']
      );
    }
    console.log(`  ✅ ${usuarios.length} usuarios migrados`);

    // Exportar mascotas
    const mascotas = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM mascotas', (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) resolve([]);
          else reject(err);
        } else resolve(rows || []);
      });
    });

    for (const mascota of mascotas) {
      await pgClient.query(
        'INSERT INTO mascotas (nombre, tipo, raza, edad, peso, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [mascota.nombre, mascota.tipo, mascota.raza, mascota.edad, mascota.peso, mascota.usuario_id]
      );
    }
    console.log(`  ✅ ${mascotas.length} mascotas migradas`);

    // Exportar citas
    const citas = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM citas', (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) resolve([]);
          else reject(err);
        } else resolve(rows || []);
      });
    });

    for (const cita of citas) {
      await pgClient.query(
        'INSERT INTO citas (usuario_id, mascota_id, fecha, hora, tipo_servicio, descripcion, estado, costo, notas_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [cita.usuario_id, cita.mascota_id, cita.fecha, cita.hora, cita.tipo_servicio, cita.descripcion, cita.estado, cita.costo, cita.notas_admin]
      );
    }
    console.log(`  ✅ ${citas.length} citas migradas`);

    db.close();
  } else {
    console.log('\n📝 No hay datos en SQLite, creando usuarios de ejemplo...');
  }

  // Asegurar que existe admin@gmail.com
  const hashedPassword = await bcrypt.hash('Password1!', 10);
  await pgClient.query(
    'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO UPDATE SET password = $3',
    ['Administrador Gmail', 'admin@gmail.com', hashedPassword, '+34-111-222-333', 'Clínica Veterinaria', 'admin']
  );
  console.log('  ✅ Usuario admin@gmail.com verificado');

  // Asegurar admin@veterinaria.com
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  await pgClient.query(
    'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
    ['Administrador', 'admin@veterinaria.com', hashedPassword2, '+34-123-456-789', 'Clínica Veterinaria Central', 'admin']
  );
  console.log('  ✅ Usuario admin@veterinaria.com verificado');

  await pgClient.end();

  console.log('\n✨ ¡Migración completada exitosamente!\n');
  console.log('📧 Credenciales disponibles:');
  console.log('   - admin@gmail.com / Password1!');
  console.log('   - admin@veterinaria.com / password123\n');
}

migrateToNeon().catch(error => {
  console.error('❌ Error en la migración:', error.message);
  process.exit(1);
});
