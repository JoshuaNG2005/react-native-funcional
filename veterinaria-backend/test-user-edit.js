// Script para probar los endpoints de edición y eliminación de usuarios
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testUserEditAndDelete() {
  console.log('🔄 Probando endpoints de gestión de usuarios...\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Login como admin...');
    const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'Password1!',
      }),
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login exitoso como:', loginData.data.user.nombre);
    console.log('---');

    // 2. Obtener lista de usuarios
    console.log('\n2️⃣ Obteniendo usuarios...');
    const usersResponse = await fetch(`${API_URL}/api/v1/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const usersData = await usersResponse.json();
    if (usersData.success) {
      console.log('✅ Total usuarios:', usersData.data.length);
      
      // Encontrar un usuario cliente para probar edición
      const testUser = usersData.data.find(u => u.rol === 'cliente' && u.id !== 12);
      
      if (testUser) {
        console.log(`📋 Usuario de prueba: ${testUser.nombre} (ID: ${testUser.id})`);
        
        // 3. Probar edición de usuario
        console.log('\n3️⃣ Actualizando información del usuario...');
        const updateResponse = await fetch(`${API_URL}/api/v1/users/${testUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: testUser.nombre,
            email: testUser.email,
            telefono: testUser.telefono || '1234-5678',
            direccion: testUser.direccion || 'San José, Costa Rica',
            rol: testUser.rol,
          }),
        });

        const updateData = await updateResponse.json();
        if (updateData.success) {
          console.log('✅ Usuario actualizado correctamente');
          console.log('   - Nombre:', updateData.data.nombre);
          console.log('   - Email:', updateData.data.email);
          console.log('   - Teléfono:', updateData.data.telefono);
        } else {
          console.log('❌ Error al actualizar:', updateData.message);
        }
      } else {
        console.log('⚠️  No se encontró usuario de prueba (cliente)');
      }
    }

    console.log('\n✅ Prueba completada');
    console.log('\nNOTA: No se probó eliminación para preservar datos reales');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserEditAndDelete();
