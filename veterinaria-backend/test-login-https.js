const https = require('https');
const http = require('http');
const url = require('url');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';
const parsedUrl = url.parse(API_URL);
const isHttps = parsedUrl.protocol === 'https:';

const data = JSON.stringify({
  email: 'admin@veterinaria.com',
  password: 'password123'
});

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || (isHttps ? 443 : 80),
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const protocol = isHttps ? https : http;
const req = protocol.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(responseData));
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
