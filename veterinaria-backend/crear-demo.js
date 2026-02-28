// Script para crear un usuario y una mascota de prueba en la base de datos
const { initDatabase, runQuery } = require('./config/database');
const bcrypt = require('bcrypt');

async function crearUsuarioYmascota() {
  await initDatabase();
  const passwordHash = await bcrypt.hash('test1234', 10);

  // Crear usuario
  const usuarioRes = await runQuery(
    `INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['Usuario Demo', 'demo@demo.com', passwordHash, '123456789', 'cliente']
  );
  const usuarioId = usuarioRes.rows[0].id;
  console.log('Usuario creado con id:', usuarioId);

  // Crear mascota
  const mascotaRes = await runQuery(
    `INSERT INTO mascotas (nombre, tipo, raza, edad, peso, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    ['Firulais', 'Perro', 'Labrador', 3, 20.5, usuarioId]
  );
  const mascotaId = mascotaRes.rows[0].id;
  console.log('Mascota creada con id:', mascotaId);

  process.exit(0);
}

crearUsuarioYmascota().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
