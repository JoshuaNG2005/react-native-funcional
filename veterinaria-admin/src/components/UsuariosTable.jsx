import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './UsuariosTable.css';

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      // Obtener todos los usuarios del endpoint correcto sin límite
      const response = await apiClient.get('/users?limit=10000');
      if (response.data.success) {
        console.log('Usuarios cargados:', response.data.data.length);
        console.log('Paginación:', response.data.pagination);
        setUsuarios(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
      // Si falla, mostrar array vacío en lugar de error
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h3>👥 Gestión de Usuarios</h3>
        <button className="refresh-btn" onClick={loadUsuarios}>
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-responsive">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>#{usuario.id}</td>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefono || '-'}</td>
                    <td>
                      <span className={`role-badge ${usuario.rol || 'cliente'}`}>
                        {usuario.rol === 'admin' ? '🔑 Admin' : '👤 Cliente'}
                      </span>
                    </td>
                    <td>{new Date(usuario.created_at || usuario.fecha_creacion).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                    No hay usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
