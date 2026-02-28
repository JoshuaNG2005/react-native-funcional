const https = require('https');
const http = require('http');
const url = require('url');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';
const parsedUrl = url.parse(API_URL);
const isHttps = parsedUrl.protocol === 'https:';

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || (isHttps ? 443 : 80),
  path: '/api/v1/admin/recreate-admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔧 Recreando admin en Render...\n');

const protocol = isHttps ? https : http;
const req = protocol.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('📊 Respuesta:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('\n✅ ADMIN RECREADO CON ÉXITO');
      console.log('   Email: admin@veterinaria.com');
      console.log('   Password: password123');
      console.log('   Rol: admin');
    }
  });
});

req.on('error', error => {
  console.error('❌ Error:', error.message);
});

req.write('{}');
req.end();
