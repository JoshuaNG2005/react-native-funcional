import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './CitasTable.css';

export default function CitasTable({ onRefresh }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/citas/admin/all');
      if (response.data.success) {
        setCitas(response.data.data);
      }
    } catch (error) {
      console.error('Error loading citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cita) => {
    setSelectedCita(cita);
    setEditData(cita);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCita(null);
  };

  const updateCita = async () => {
    if (!editData.estado) {
      alert('⚠️ Debes seleccionar un estado');
      return;
    }

    try {
      console.log('📤 Actualizando cita:', selectedCita.id);
      console.log('📦 Datos originales:', selectedCita);
      console.log('📦 Datos nuevos:', editData);
      
      const response = await apiClient.put(`/citas/${selectedCita.id}`, editData);
      
      console.log('✅ Respuesta del servidor:', response.data);
      console.log('✅ Status:', response.status);
      
      if (response.data.success) {
        await loadCitas();
        onRefresh?.();
        closeModal();
        
        let mensaje = '✅ Cita actualizada exitosamente';
        if (editData.estado === 'completada' && selectedCita.estado !== 'completada') {
          mensaje += '\n\n• Historial médico actualizado\n• Información disponible en la app del usuario';
        }
        alert(mensaje);
      } else {
        alert('⚠️ ' + (response.data.message || 'No se pudo actualizar la cita'));
      }
    } catch (error) {
      console.error('❌ Error al actualizar cita:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      alert('❌ Error al actualizar cita: ' + (error.response?.data?.message || error.message));
    }
  };

  const completarCita = async (cita) => {
    if (!window.confirm(`¿Marcar la cita #${cita.id} de ${cita.usuario_nombre} (${cita.mascota_nombre}) como completada?`)) {
      return;
    }

    try {
      console.log('📤 Completando cita:', cita.id);
      console.log('📦 Datos de la cita:', cita);
      
      const dataToSend = {
        estado: 'completada',
        costo: cita.costo || 0,
        notas_admin: cita.notas_admin || `Servicio completado: ${cita.tipo_servicio}`,
        descripcion: cita.descripcion || `Atención completada el ${new Date().toLocaleDateString('es-ES')}`
      };
      
      console.log('📤 Enviando datos:', dataToSend);
      
      const response = await apiClient.put(`/citas/${cita.id}`, dataToSend);
      
      console.log('✅ Respuesta del servidor:', response.data);
      console.log('✅ Status:', response.status);
      
      if (response.data.success) {
        await loadCitas();
        onRefresh?.();
        alert('✅ Cita marcada como completada.\n\n• Historial médico actualizado\n• Tratamiento registrado\n\nLa información ya está disponible para el usuario en la app móvil.');
      } else {
        alert('⚠️ ' + (response.data.message || 'No se pudo completar la cita'));
      }
    } catch (error) {
      console.error('❌ Error al completar cita:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      alert('❌ Error al completar cita: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteCita = async (id) => {
    if (window.confirm('¿Eliminar esta cita?')) {
      try {
        await apiClient.delete(`/citas/${id}`);
        loadCitas();
        onRefresh?.();
        alert('Cita eliminada');
      } catch (error) {
        alert('Error al eliminar cita');
      }
    }
  };

  return (
    <div className="citas-container">
      <div className="citas-header">
        <h3>📅 Gestión de Citas</h3>
        <button className="refresh-btn" onClick={loadCitas}>
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-responsive">
          <table className="citas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Mascota</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>#{cita.id}</td>
                  <td>
                    <strong>{cita.usuario_nombre}</strong>
                    <br />
                    <small>{cita.usuario_email}</small>
                  </td>
                  <td>{cita.mascota_nombre}</td>
                  <td>{cita.fecha}</td>
                  <td>{cita.hora}</td>
                  <td>{cita.tipo_servicio}</td>
                  <td>
                    <span className={`status-badge ${cita.estado}`}>{cita.estado}</span>
                  </td>
                  <td>
                    {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                      <button
                        className="btn-complete"
                        onClick={() => completarCita(cita)}
                        title="Marcar como completada"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="btn-edit"
                      onClick={() => openModal(cita)}
                      title="Editar cita"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteCita(cita.id)}
                      title="Eliminar cita"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedCita && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Editar Cita #{selectedCita.id}</h4>

            <div className="form-group">
              <label>Estado</label>
              <select
                value={editData.estado}
                onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label>Costo</label>
              <input
                type="number"
                value={editData.costo || ''}
                onChange={(e) => setEditData({ ...editData, costo: e.target.value })}
                placeholder="Ej: 50.00"
              />
            </div>

            <div className="form-group">
              <label>Notas del Admin</label>
              <textarea
                value={editData.notas_admin || ''}
                onChange={(e) => setEditData({ ...editData, notas_admin: e.target.value })}
                placeholder="Notas internas"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-save" onClick={updateCita}>
                ✓ Guardar
              </button>
              <button className="btn-cancel" onClick={closeModal}>
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
