const bcrypt = require('bcryptjs');
const { runQuery } = require('./config/database'); // Quitamos getQuery ya que runQuery devuelve el array directamente

async function seedDatabase() {
  try {
    // 1. Verificar si el admin ya existe (Cambiamos $1 por ?)
    const users = await runQuery('SELECT * FROM usuarios WHERE email = ?', [
      'admin@veterinaria.com',
    ]);
    const adminExists = users.length > 0 ? users[0] : null;

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      // 2. Insertar Admin (Sintaxis MySQL con ?)
      await runQuery(
        'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Administrador',
          'admin@veterinaria.com',
          hashedPassword,
          '+34-123-456-789',
          'Clínica Veterinaria Central',
          'admin',
        ]
      );

      console.log('✅ Usuario admin creado en AWS: admin@veterinaria.com / password123');
    } else {
      console.log('✅ Usuario admin ya existe en la nube');
      
      // Asegurar que el rol sea 'admin'
      await runQuery(
        'UPDATE usuarios SET rol = ? WHERE email = ?',
        ['admin', 'admin@veterinaria.com']
      );
      console.log('✅ Rol del admin verificado en AWS');
    }

    // 3. Verificar cliente de prueba
    const clients = await runQuery('SELECT * FROM usuarios WHERE email = ?', [
      'cliente@ejemplo.com',
    ]);
    const clientExists = clients.length > 0 ? clients[0] : null;

    if (!clientExists) {
      const hashedPassword = await bcrypt.hash('cliente123', 10);

      await runQuery(
        'INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Cliente Ejemplo',
          'cliente@ejemplo.com',
          hashedPassword,
          '+34-987-654-321',
          'Calle Principal 123',
          'cliente',
        ]
      );

      console.log('✅ Usuario cliente creado en AWS: cliente@ejemplo.com / cliente123');
    } else {
      console.log('✅ Usuario cliente ya existe en la nube');
    }

    // 🏥 4. Verificar y crear médico por defecto (ID 1)
    const medicos = await runQuery('SELECT * FROM medicos WHERE id = ?', [1]);
    const medicoExists = medicos.length > 0 ? medicos[0] : null;

    if (!medicoExists) {
      await runQuery(
        'INSERT INTO medicos (id, nombre, especialidad, telefono, email) VALUES (?, ?, ?, ?, ?)',
        [
          1,
          'Dr. Veterinario General',
          'Medicina General',
          '+34-555-123-456',
          'veterinario@clinica.com'
        ]
      );
      console.log('✅ Médico por defecto creado: Dr. Veterinario General (ID 1)');
    } else {
      console.log('✅ Médico por defecto ya existe (ID 1)');
    }

    console.log('\n📊 Base de datos de AWS lista para usar\n');
  } catch (error) {
    console.error('❌ Error en seed de AWS:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = seedDatabase;