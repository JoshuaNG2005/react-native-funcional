// Test rápido del backend en Render
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

const testLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@veterinaria.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
