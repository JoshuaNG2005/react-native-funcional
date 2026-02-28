const https = require('https');
const http = require('http');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testMascotasAdmin() {
  try {
    console.log('🧪 Probando endpoint de mascotas para admin...\n');

    // Primero hacer login como  admin
    console.log('📡 Haciendo login como admin...');
    const loginData = await makeRequest(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123',
      }),
    });
    
    if (!loginData.success) {
      console.log('❌ Error en login:', loginData.message);
      return;
    }

    console.log('✅ Login exitoso como admin\n');
    const token = loginData.token;

    // Probar endpoint de mascotas
    console.log('📡 Solicitando todas las mascotas...');
    const mascotasData = await makeRequest(`${API_URL}/api/v1/mascotas/admin/all`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (mascotasData.success) {
      console.log(`✅ Se encontraron ${mascotasData.data.length} mascotas\n`);
      
      if (mascotasData.data.length > 0) {
        console.log('📋 Primeras 3 mascotas:');
        mascotasData.data.slice(0, 3).forEach((mascota, index) => {
          console.log(`\n${index + 1}. ${mascota.nombre} (${mascota.tipo})`);
          console.log(`   Dueño: ${mascota.usuario_nombre || 'N/A'} (${mascota.usuario_email || 'N/A'})`);
          console.log(`   Raza: ${mascota.raza || 'N/A'} | Edad: ${mascota.edad || 'N/A'} años`);
          console.log(`   Registrado: ${new Date(mascota.fecha_creacion).toLocaleDateString()}`);
        });
      } else {
        console.log('ℹ️  No hay mascotas registradas aún');
      }
    } else {
      console.log('❌ Error:', mascotasData.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testMascotasAdmin();
