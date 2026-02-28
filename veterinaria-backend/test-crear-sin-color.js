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

async function test() {
  try {
    console.log('🧪 Test 1: Crear mascota SIN campo color...\n');

    // Login como admin
    console.log('📡 Haciendo login con admin...');
    const loginResult = await makeRequest(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@veterinaria.com',
        password: 'password123',
      }),
    });

    if (!loginResult.data.success) {
      console.log('❌ Error en login:', loginResult.data.message);
      return;
    }

    console.log('✅ Login exitoso\n');
    const token = loginResult.data.token;

    // Test 1: Sin color
    console.log('📡 Test 1: Creando mascota SIN color...');
    const test1 = await makeRequest(`${API_URL}/api/v1/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: 'Test Sin Color',
        tipo: 'Perro',
        raza: 'Labrador',
        edad: 3,
        peso: 25.5,
      }),
    });

    console.log('Status:', test1.status);
    console.log('Respuesta:', JSON.stringify(test1.data, null, 2));

    // Test 2: Con color
    console.log('\n📡 Test 2: Creando mascota CON color...');
    const test2 = await makeRequest(`${API_URL}/api/v1/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: 'Test Con Color',
        tipo: 'Gato',
        raza: 'Siamés',
        edad: 2,
        peso: 4.5,
        color: 'Beige',
      }),
    });

    console.log('Status:', test2.status);
    console.log('Respuesta:', JSON.stringify(test2.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
