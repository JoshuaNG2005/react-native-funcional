const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Limpiando base de datos...');
  
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'usuarios_db',
      port: process.env.DB_PORT || 3306,
    });

    const connection = await pool.getConnection();

    // Deshabilitar FK constraints temporalmente
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');

    // Dropearse las tablas si existen
    console.log('📋 Eliminando tablas existentes...');
    await connection.execute('DROP TABLE IF EXISTS citas');
    await connection.execute('DROP TABLE IF EXISTS mascotas');
    await connection.execute('DROP TABLE IF EXISTS usuarios');

    // Re-habilitar FK constraints
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');

    // Crear tablas nuevas con la estructura correcta
    console.log('🏗️  Creando tablas con estructura correcta...');
    
    await connection.execute(`
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        direccion VARCHAR(255),
        rol ENUM('cliente', 'admin') DEFAULT 'cliente',
        estado VARCHAR(50) DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE mascotas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        raza VARCHAR(100),
        edad INT,
        peso DECIMAL(5, 2),
        usuario_id INT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario (usuario_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE citas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        mascota_id INT NOT NULL,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        tipo_servicio VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') DEFAULT 'pendiente',
        costo DECIMAL(10, 2),
        notas_admin TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
        INDEX idx_usuario (usuario_id),
        INDEX idx_mascota (mascota_id),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Base de datos limpiada y recreada correctamente');
    
    connection.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error.message);
    process.exit(1);
  }
}

resetDatabase();
