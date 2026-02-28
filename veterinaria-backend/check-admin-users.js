const { Pool } = require('pg');
require('dotenv').config();

async function checkAdminUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔍 Buscando usuarios administradores...\n');
    
    const result = await pool.query(
      "SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE rol = 'admin' OR email LIKE '%admin%'"
    );

    if (result.rows.length === 0) {
      console.log('❌ No se encontraron usuarios administradores\n');
    } else {
      console.log(`✅ Se encontraron ${result.rows.length} usuario(s):\n`);
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Nombre: ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: "${user.rol}"`);
        console.log(`   Creado: ${user.fecha_creacion}`);
        console.log('');
      });

      console.log('\n💡 Para iniciar sesión como admin, usa:');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: Password1! (con P mayúscula)\n');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAdminUsers();
