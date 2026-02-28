const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkMascotasTable() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar columnas de la tabla mascotas
    console.log('📋 Columnas de la tabla mascotas:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name='mascotas'
      ORDER BY ordinal_position
    `);

    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n📊 Mascotas en la tabla:');
    const mascotasResult = await client.query('SELECT COUNT(*) as total FROM mascotas');
    console.log(`  Total: ${mascotasResult.rows[0].total}`);

    if (mascotasResult.rows[0].total > 0) {
      console.log('\n🔍 Últimas 3 mascotas:');
      const lastMascotas = await client.query('SELECT id, nombre, tipo, raza, edad, peso, color, usuario_id FROM mascotas ORDER BY fecha_creacion DESC LIMIT 3');
      lastMascotas.rows.forEach(m => {
        console.log(`  ID: ${m.id} | ${m.nombre} (${m.tipo}) | Color: ${m.color || 'NULL'} | Usuario: ${m.usuario_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

checkMascotasTable();
