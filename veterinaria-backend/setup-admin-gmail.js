const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupAdminGmail() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔧 Configurando usuario administrador...\n');
    
    // Buscar si existe el usuario
    const checkUser = await pool.query(
      "SELECT * FROM usuarios WHERE email = 'admin@gmail.com'"
    );

    const hashedPassword = await bcrypt.hash('Password1!', 10);

    if (checkUser.rows.length > 0) {
      console.log('⚠️  Usuario admin@gmail.com ya existe');
      console.log('   Rol actual:', checkUser.rows[0].rol);
      
      // Actualizar a rol admin y contraseña
      await pool.query(
        "UPDATE usuarios SET rol = 'admin', password = $1 WHERE email = 'admin@gmail.com'",
        [hashedPassword]
      );
      console.log('✅ Usuario actualizado a rol admin con nueva contraseña\n');
    } else {
      // Crear nuevo usuario admin
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Administrador Gmail', 'admin@gmail.com', hashedPassword, '+34-111-222-333', 'Clínica Veterinaria', 'admin']
      );
      console.log('✅ Usuario admin@gmail.com creado exitosamente\n');
    }

    // Mostrar resultado
    const result = await pool.query(
      "SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE email = 'admin@gmail.com'"
    );
    
    console.log('📊 Usuario Admin:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Nombre:', result.rows[0].nombre);
    console.log('   Email:', result.rows[0].email);
    console.log('   Rol:', result.rows[0].rol);
    console.log('   Creado:', result.rows[0].fecha_creacion);
    console.log('\n🔑 Credenciales para iniciar sesión:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: Password1!');
    console.log('   (La P es mayúscula y termina con !)\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupAdminGmail();
