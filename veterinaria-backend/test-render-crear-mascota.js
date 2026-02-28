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
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
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
    console.log('🧪 Probando API en Render...\n');

    // 1. Health check
    console.log('📡 1. Health check...');
    const health = await makeRequest(`${API_URL}/api/v1/health`, { method: 'GET' });
    console.log('Status:', health.status);
    console.log('Data:', health.data);
    console.log('');

    // 2. Login
    console.log('📡 2. Login como cliente (lucky@gmail.com)...');
    const loginResult = await makeRequest(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cliente@ejemplo.com',
        password: 'cliente123',
      }),
    });

    console.log('Status:', loginResult.status);
    console.log('Success:', loginResult.data.success);
    if (!loginResult.data.success) {
      console.log('Error:', loginResult.data.message);
      return;
    }

    const token = loginResult.data.token;
    console.log('✅ Token obtenido\n');

    // 3. Crear mascota CON color
    console.log('📡 3. Crear mascota con color...');
    const createResult = await makeRequest(`${API_URL}/api/v1/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: 'Pez Test',
        tipo: 'Pez',
        raza: 'Pez gato',
        edad: 3,
        peso: 6,
        color: 'Negro'
      }),
    });

    console.log('Status:', createResult.status);
    console.log('Data:', JSON.stringify(createResult.data, null, 2));

    if (createResult.data.success) {
      console.log('\n✅ ¡Mascota creada exitosamente!');
    } else {
      console.log('\n❌ Error al crear mascota');
      console.log('Mensaje:', createResult.data.message);
      if (createResult.data.error) {
        console.log('Error detallado:', createResult.data.error);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
