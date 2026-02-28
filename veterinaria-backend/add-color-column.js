const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addColorColumn() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='mascotas' AND column_name='color'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('ℹ️  La columna "color" ya existe en la tabla mascotas');
      return;
    }

    // Agregar la columna color
    await client.query(`
      ALTER TABLE mascotas 
      ADD COLUMN color VARCHAR(100)
    `);

    console.log('✅ Columna "color" agregada exitosamente a la tabla mascotas');

  } catch (error) {
    console.error('❌ Error al agregar columna:', error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

addColorColumn();
