const https = require('https');

const options = {
  hostname: 'api-express-mysql-de-jime.onrender.com',
  path: '/api/v1/debug/debug',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\n📊 RESPUESTA DEL SERVIDOR:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', error => {
  console.error('❌ Error:', error.message);
});

req.end();
