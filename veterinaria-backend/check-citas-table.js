require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndCreateCitasTable() {
  try {
    // Verificar si la tabla existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'citas'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✅ La tabla citas ya existe');
      
      // Mostrar estructura de la tabla
      const columns = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'citas'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estructura de la tabla citas:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
      });

      // Verificar si necesita la columna fecha_hora
      const hasFechaHora = columns.rows.some(col => col.column_name === 'fecha_hora');
      
      if (!hasFechaHora) {
        console.log('\n⚠️  La tabla no tiene la columna fecha_hora');
        console.log('Agregando columnas necesarias...');
        
        // Agregar fecha_hora si no existe
        await pool.query(`
          ALTER TABLE citas 
          ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMP
        `);
        
        // Si tiene fecha y hora separadas, migrar los datos
        const hasFecha = columns.rows.some(col => col.column_name === 'fecha');
        const hasHora = columns.rows.some(col => col.column_name === 'hora');
        
        if (hasFecha && hasHora) {
          console.log('Migrando datos de fecha/hora separadas a fecha_hora...');
          await pool.query(`
            UPDATE citas 
            SET fecha_hora = (fecha || ' ' || hora)::TIMESTAMP
            WHERE fecha_hora IS NULL AND fecha IS NOT NULL AND hora IS NOT NULL
          `);
        }
        
        console.log('✅ Tabla actualizada con fecha_hora');
      }

      // Verificar columna motivo
      const hasMotivo = columns.rows.some(col => col.column_name === 'motivo');
      if (!hasMotivo) {
        console.log('Agregando columna motivo...');
        await pool.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS motivo TEXT`);
        
        // Migrar de tipo_servicio si existe
        const hasTipoServicio = columns.rows.some(col => col.column_name === 'tipo_servicio');
        if (hasTipoServicio) {
          await pool.query(`UPDATE citas SET motivo = tipo_servicio WHERE motivo IS NULL`);
        }
        console.log('✅ Columna motivo agregada');
      }

      // Verificar columna notas
      const hasNotas = columns.rows.some(col => col.column_name === 'notas');
      if (!hasNotas) {
        console.log('Agregando columna notas...');
        await pool.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas TEXT`);
        
        // Migrar de descripcion si existe
        const hasDescripcion = columns.rows.some(col => col.column_name === 'descripcion');
        if (hasDescripcion) {
          await pool.query(`UPDATE citas SET notas = descripcion WHERE notas IS NULL`);
        }
        console.log('✅ Columna notas agregada');
      }

    } else {
      console.log('⚠️  La tabla citas no existe, creándola...');
      
      await pool.query(`
        CREATE TABLE citas (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          mascota_id INTEGER NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
          fecha_hora TIMESTAMP NOT NULL,
          motivo TEXT NOT NULL,
          notas TEXT,
          estado VARCHAR(50) DEFAULT 'programada',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla citas creada exitosamente');
    }

    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM citas');
    console.log(`\n📊 Total de citas en la base de datos: ${count.rows[0].count}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAndCreateCitasTable();
