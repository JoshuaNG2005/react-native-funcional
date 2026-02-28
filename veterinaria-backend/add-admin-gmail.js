const bcrypt = require('bcryptjs');
const { initDatabase, getQuery, runQuery } = require('./config/database');

async function addAdminGmail() {
  try {
    await initDatabase();

    // Verificar si el usuario ya existe
    const userExists = await getQuery('SELECT * FROM usuarios WHERE email = ?', [
      'admin@gmail.com',
    ]);

    if (userExists) {
      console.log('⚠️  El usuario admin@gmail.com ya existe');
      
      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash('Password1!', 10);
      await runQuery('UPDATE usuarios SET password = ? WHERE email = ?', [
        hashedPassword,
        'admin@gmail.com',
      ]);
      console.log('✅ Contraseña actualizada para admin@gmail.com');
    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('Password1!', 10);

      await runQuery(
        'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Administrador Gmail',
          'admin@gmail.com',
          hashedPassword,
          '+34-111-222-333',
          'Clínica Veterinaria',
          'admin',
        ]
      );

      console.log('✅ Usuario admin@gmail.com creado exitosamente');
    }

    console.log('\n📧 Email: admin@gmail.com');
    console.log('🔑 Password: Password1!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdminGmail();
