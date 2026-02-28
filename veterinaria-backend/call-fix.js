// Llamar al endpoint temporal para actualizar el rol
const callFixEndpoint = async () => {
  try {
    const response = await fetch('https://api-express-mysql-de-jime.onrender.com/api/v1/temp/fix-admin-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    console.log('✅ Resultado:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

callFixEndpoint();
