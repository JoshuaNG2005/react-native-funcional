-- Script SQL para crear la tabla citas compatible con Neon/Supabase/Postgres
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mascota_id INTEGER NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP NOT NULL,
    motivo TEXT NOT NULL,
    notas TEXT,
    estado VARCHAR(50) DEFAULT 'programada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_citas_usuario_id ON citas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_mascota_id ON citas(mascota_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
