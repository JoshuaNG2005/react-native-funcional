const http = require('http');

const data = JSON.stringify({
  email: 'admin@veterinaria.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔐 Probando login en localhost:3001...\n');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(responseData);
    console.log('\n📊 Respuesta:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.data?.user?.rol === 'admin') {
      console.log('\n✅ ¡ROL ES ADMIN! Funciona correctamente');
    } else {
      console.log('\n❌ Rol no es admin:', response.data?.user?.rol);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
