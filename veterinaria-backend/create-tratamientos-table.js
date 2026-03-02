const mysql = require('mysql2/promise');

async function createTratamientosTable() {
  let connection;
  try {
    console.log('🔌 Conectando a AWS RDS MySQL...');
    
    connection = await mysql.createConnection({
      host: 'usuarios-db.cxwos68mqs13.us-east-2.rds.amazonaws.com',
      user: 'admin',
      password: process.env.DB_PASSWORD || 'Tu_Contraseña_Aqui',
      database: 'usuarios_db',
    });

    console.log('✅ Conectado a la base de datos');

    // Crear tabla tratamientos
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tratamientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mascota_id INT NOT NULL,
        cita_id INT,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        medicamento VARCHAR(255),
        dosis VARCHAR(100),
        frecuencia VARCHAR(100),
        duracion VARCHAR(100),
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE,
        notas TEXT,
        estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
        FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Tabla tratamientos creada exitosamente');

    // Verificar que la tabla existe
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'tratamientos'`);
    if (tables.length > 0) {
      console.log('✅ Tabla tratamientos verificada en la base de datos');
      
      // Mostrar estructura de la tabla
      const [columns] = await connection.execute(`DESCRIBE tratamientos`);
      console.log('\n📋 Estructura de la tabla:');
      console.table(columns);
    }

    await connection.end();
    console.log('\n✅ Operación completada correctamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createTratamientosTable();
