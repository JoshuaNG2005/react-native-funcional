const https = require('https');

const options = {
  hostname: 'api-express-mysql-de-jime.onrender.com',
  path: '/api/v1/fix/update-admin-role',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', error => {
  console.error('❌ Error:', error.message);
});

req.write('{}');
req.end();
