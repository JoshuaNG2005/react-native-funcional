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
          resolve({ status: res.statusCode, data: JSON.parse(data) });
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

async function testCrearMascota() {
  try {
    console.log('🧪 Probando creación de mascota...\n');

    // Login como usuario normal
    console.log('📡 Haciendo login...');
    const loginResult = await makeRequest(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'lucky@gmail.com',
        password: 'password123',
      }),
    });

    if (!loginResult.data.success) {
      console.log('❌ Error en login:', loginResult.data.message);
      console.log('ℹ️  Usa credenciales de un usuario existente');
      return;
    }

    console.log('✅ Login exitoso\n');
    const token = loginResult.data.token;

    // Crear mascota
    console.log('📡 Creando mascota de prueba...');
    const mascotaResult = await makeRequest(`${API_URL}/api/v1/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: 'Firulais Test',
        tipo: 'Perro',
        raza: 'Labrador',
        edad: 3,
        peso: 25.5,
        color: 'Dorado',
      }),
    });

    console.log('Status:', mascotaResult.status);
    console.log('Respuesta:', mascotaResult.data);

    if (mascotaResult.data.success) {
      console.log('\n✅ Mascota creada exitosamente!');
      console.log('ID:', mascotaResult.data.data.id);
      console.log('Nombre:', mascotaResult.data.data.nombre);
    } else {
      console.log('\n❌ Error al crear mascota:', mascotaResult.data.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testCrearMascota();
