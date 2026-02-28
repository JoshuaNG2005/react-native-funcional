import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import CitasTable from '../components/CitasTable';
import UsuariosTable from '../components/UsuariosTable';
import MascotasTable from '../components/MascotasTable';
import './Dashboard.css';

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('citas');
  const [stats, setStats] = useState({
    totalCitas: 0,
    totalUsuarios: 0,
    totalMascotas: 0,
    citasPendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    loadStats();
    // Cargar datos del admin
    if (admin) {
      setProfileData({
        nombre: admin.nombre || '',
        email: admin.email || '',
        telefono: admin.telefono || ''
      });
    }
  }, [admin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [citasRes, usuariosRes, mascotasRes] = await Promise.all([
        apiClient.get('/citas/admin/all').catch(() => ({ data: { success: false, data: [] } })),
        apiClient.get('/users?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
        apiClient.get('/mascotas/admin/all').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      let pendientes = 0;
      let totalCitas = 0;
      let totalUsuarios = 0;
      let totalMascotas = 0;
      
      if (citasRes.data.success && citasRes.data.data) {
        const citas = citasRes.data.data;
        totalCitas = citas.length;
        pendientes = citas.filter((c) => c.estado === 'pendiente').length;
      }
      
      if (usuariosRes.data.success && usuariosRes.data.data) {
        totalUsuarios = usuariosRes.data.data.length;
      }

      if (mascotasRes.data.success && mascotasRes.data.data) {
        totalMascotas = mascotasRes.data.data.length;
      }
      
      setStats({
        totalCitas,
        totalUsuarios,
        citasPendientes: pendientes,
        totalMascotas,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleSaveProfile = async () => {
    try {
      console.log('💾 Guardando perfil:', profileData);
      const response = await apiClient.put('/auth/profile', profileData);
      console.log('✅ Respuesta:', response.data);
      
      if (response.data.success) {
        alert('✅ Perfil actualizado exitosamente');
      } else {
        alert('❌ ' + (response.data.message || 'Error al actualizar perfil'));
      }
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      alert('❌ Error al actualizar perfil: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>🏥 VetAdmin</h1>
          <p className="admin-name">{admin?.nombre || 'Administrador'}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('citas'); setShowConfig(false); }}
          >
            📅 Citas
          </button>
          <button
            className={`nav-item ${activeTab === 'mascotas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('mascotas'); setShowConfig(false); }}
          >
            🐾 Mascotas
          </button>
          <button
            className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => { setActiveTab('usuarios'); setShowConfig(false); }}
          >
            👥 Usuarios
          </button>
          <button
            className={`nav-item ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reportes'); setShowConfig(false); }}
          >
            📊 Reportes
          </button>
          <button
            className={`nav-item ${showConfig ? 'active' : ''}`}
            onClick={() => { setShowConfig(true); setActiveTab(''); }}
          >
            ⚙️ Configuración
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h2>Dashboard Administrativo</h2>
          <p>Gestión del Sistema de Veterinaria</p>
        </div>

        {!loading && activeTab === 'citas' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Citas</h3>
                <p className="stat-number">{stats.totalCitas}</p>
              </div>
              <div className="stat-card">
                <h3>Citas Pendientes</h3>
                <p className="stat-number pending">{stats.citasPendientes}</p>
              </div>
              <div className="stat-card">
                <h3>Total Usuarios</h3>
                <p className="stat-number">{stats.totalUsuarios}</p>
              </div>
              <div className="stat-card">
                <h3>Total Mascotas</h3>
                <p className="stat-number">{stats.totalMascotas}</p>
              </div>
            </div>
          </>
        )}

        <div className="content-area">
          {showConfig ? (
            <div className="config-container">
              <h2>⚙️ Configuración</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>Gestiona los datos de tu perfil de administrador</p>
              
              <div className="config-section">
                <h3>👤 Editar Perfil</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      value={profileData.nombre}
                      onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                </div>
                <button className="save-profile-btn" onClick={handleSaveProfile}>
                  💾 Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'citas' && <CitasTable onRefresh={loadStats} />}
              {activeTab === 'usuarios' && <UsuariosTable />}
              {activeTab === 'mascotas' && <MascotasTable />}
              {activeTab === 'reportes' && (
                <div className="section-placeholder">
                  <h2>📊 Reportes y Estadísticas</h2>
                  <p>Panel de reportes en desarrollo</p>
                  <div className="stats-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total de Citas:</span>
                      <span className="summary-value">{stats.totalCitas}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Usuarios Registrados:</span>
                      <span className="summary-value">{stats.totalUsuarios}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Mascotas Registradas:</span>
                      <span className="summary-value">{stats.totalMascotas}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Citas Pendientes:</span>
                      <span className="summary-value">{stats.citasPendientes}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
