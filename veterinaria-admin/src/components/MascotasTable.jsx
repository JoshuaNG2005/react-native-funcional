import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './MascotasTable.css';

export default function MascotasTable() {
  const [mascotas, setMascotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, usuariosRes] = await Promise.all([
        apiClient.get('/mascotas/admin/all').catch(() => ({ data: { success: false, data: [] } })),
        apiClient.get('/users?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (mascotasRes.data.success) {
        setMascotas(mascotasRes.data.data || []);
      }

      if (usuariosRes.data.success) {
        setUsuarios(usuariosRes.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario ? usuario.nombre : 'Desconocido';
  };

  const getUserEmail = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario ? usuario.email : '-';
  };

  const getTipoEmoji = (tipo) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('perro')) return '🐕';
    if (tipoLower.includes('gato')) return '🐈';
    if (tipoLower.includes('ave') || tipoLower.includes('pájaro')) return '🦜';
    if (tipoLower.includes('pez')) return '🐟';
    if (tipoLower.includes('conejo')) return '🐰';
    if (tipoLower.includes('hamster')) return '🐹';
    if (tipoLower.includes('reptil')) return '🦎';
    return '🐾';
  };

  const filteredMascotas = mascotas.filter((mascota) => {
    const userName = getUserName(mascota.usuario_id).toLowerCase();
    const nombreMascota = mascota.nombre?.toLowerCase() || '';
    const tipo = mascota.tipo?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return userName.includes(searchLower) || nombreMascota.includes(searchLower) || tipo.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  return (
    <div className="mascotas-table-container">
      <div className="table-header">
        <h3>🐾 Gestión de Mascotas Registradas</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por dueño, mascota o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredMascotas.length === 0 ? (
        <div className="empty-state">
          <p>📭 No hay mascotas registradas</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="mascotas-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Peso</th>
                <th>Color</th>
                <th>Dueño</th>
                <th>Email</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMascotas.map((mascota) => (
                <tr key={mascota.id}>
                  <td>
                    <span className="tipo-badge">
                      {getTipoEmoji(mascota.tipo)} {mascota.tipo}
                    </span>
                  </td>
                  <td className="mascota-nombre">{mascota.nombre}</td>
                  <td>{mascota.raza || '-'}</td>
                  <td>{mascota.edad ? `${mascota.edad} años` : '-'}</td>
                  <td>{mascota.peso ? `${mascota.peso} kg` : '-'}</td>
                  <td>{mascota.color || '-'}</td>
                  <td className="usuario-nombre">{getUserName(mascota.usuario_id)}</td>
                  <td className="usuario-email">{getUserEmail(mascota.usuario_id)}</td>
                  <td>{new Date(mascota.fecha_creacion).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Total de mascotas: <strong>{filteredMascotas.length}</strong></p>
      </div>
    </div>
  );
}
