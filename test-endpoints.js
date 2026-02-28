const email = 'admin@veterinaria.com';
const password = 'password123';

(async () => {
  try {
    console.log('🔐 Probando login...');
    const loginRes = await fetch('https://api-express-mysql-de-jime.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('\n👤 Probando GET /users...');
      
      const usersRes = await fetch('https://api-express-mysql-de-jime.onrender.com/api/v1/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const usersData = await usersRes.json();
      console.log('Users response:', JSON.stringify(usersData, null, 2));
      console.log(`\n📊 Total usuarios encontrados: ${usersData.data ? usersData.data.length : 0}`);
    } else {
      console.log('❌ Login fallido');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
