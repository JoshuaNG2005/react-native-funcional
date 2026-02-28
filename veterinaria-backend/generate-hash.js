const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Password1!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('\n=== Script SQL para Neon ===\n');
  console.log(`INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES 
('Administrador Gmail', 'admin@gmail.com', '${hashedPassword}', '+34-111-222-333', 'Clínica Veterinaria', 'admin');`);
  console.log('\n=============================\n');
  console.log('📋 Copia este SQL y ejecútalo en la consola de Neon.tech');
  console.log('🌐 https://console.neon.tech\n');
}

generateHash();
