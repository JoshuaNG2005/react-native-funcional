const { Client } = require('pg');

const NEON_CONNECTION = 'postgresql://neondb_owner:npg_24ygwNfLnoCU@ep-snowy-mouse-ai2qasyt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkUsers() {
  const pgClient = new Client({ connectionString: NEON_CONNECTION });
  await pgClient.connect();
  
  console.log('\n📋 Usuarios en Neon:\n');
  
  const result = await pgClient.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY id');
  
  result.rows.forEach(user => {
    console.log(`ID: ${user.id} | Email: ${user.email.padEnd(30)} | Rol: ${user.rol} | Nombre: ${user.nombre}`);
  });
  
  console.log(`\n✅ Total: ${result.rows.length} usuarios\n`);
  
  await pgClient.end();
}

checkUsers().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
