const { Client } = require('pg');

async function fixRoleInNeon() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_24ygwNfLnoCU@ep-snowy-mouse-ai2qasyt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Neon');

    const result = await client.query(
      "UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@veterinaria.com' RETURNING *"
    );

    console.log('✅ Rol actualizado en Neon:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixRoleInNeon();
