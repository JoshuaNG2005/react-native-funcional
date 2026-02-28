const { Client } = require('pg');
require('dotenv').config();

const NEON_CONNECTION = process.env.DATABASE_URL;

async function updateAdminRole() {
  const pgClient = new Client({ connectionString: NEON_CONNECTION });
  await pgClient.connect();
  
  console.log('\n🔧 Actualizando rol de admin@gmail.com...\n');
  
  await pgClient.query("UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@gmail.com'");
  
  const result = await pgClient.query("SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@gmail.com'");
  
  console.log('✅ Usuario actualizado:');
  console.log(`   Email: ${result.rows[0].email}`);
  console.log(`   Nombre: ${result.rows[0].nombre}`);
  console.log(`   Rol: ${result.rows[0].rol}`);
  console.log('');
  
  await pgClient.end();
}

updateAdminRole().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
