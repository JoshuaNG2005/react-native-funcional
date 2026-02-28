import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface Cita {
  id: number;
  usuario_nombre: string;
  mascota_nombre: string;
  fecha: string;
  hora: string;
  tipo_servicio: string;
  descripcion?: string;
  estado: string;
}

const getApiUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
};

export default function CitasScreen() {
  const { token } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [editData, setEditData] = useState({ estado: '', costo: '', notas_admin: '' });
  const [newCita, setNewCita] = useState({
    mascota_id: '',
    fecha: '',
    hora: '',
    tipo_servicio: '',
    descripcion: '',
  });

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/v1/citas/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCitas(data.data);
      }
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCitas();
  };

  const handleEditCita = (cita: Cita) => {
    setSelectedCita(cita);
    setEditData({ estado: cita.estado, costo: '', notas_admin: '' });
    setEditModalVisible(true);
  };

  const handleUpdateCita = async () => {
    if (!selectedCita) return;

    try {
      console.log('📤 Actualizando cita:', selectedCita.id);
      const response = await fetch(`${getApiUrl()}/api/v1/citas/${selectedCita.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      console.log('✅ Respuesta:', data);

      if (data.success) {
        Alert.alert('✅ Éxito', 'Cita actualizada correctamente');
        setEditModalVisible(false);
        fetchCitas();
      } else {
        Alert.alert('❌ Error', data.message || 'No se pudo actualizar la cita');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Error', 'Error al actualizar la cita');
    }
  };

  const handleCompletarCita = async (cita: Cita) => {
    Alert.alert(
      '¿Completar cita?',
      `¿Marcar la cita de ${cita.usuario_nombre} (${cita.mascota_nombre}) como completada?\n\nEsto creará automáticamente el registro en el historial médico.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              console.log('📤 Completando cita:', cita.id);
              const response = await fetch(`${getApiUrl()}/api/v1/citas/${cita.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  estado: 'completada',
                  notas_admin: `Servicio completado: ${cita.tipo_servicio}`,
                }),
              });

              const data = await response.json();
              console.log('✅ Respuesta:', data);

              if (data.success) {
                Alert.alert('✅ Éxito', 'Cita completada y registrada en historial médico');
                fetchCitas();
              } else {
                Alert.alert('❌ Error', data.message || 'No se pudo completar la cita');
              }
            } catch (error) {
              console.error('❌ Error:', error);
              Alert.alert('❌ Error', 'Error al completar la cita');
            }
          },
        },
      ]
    );
  };

  const handleCreateCita = async () => {
    if (!newCita.mascota_id || !newCita.fecha || !newCita.hora || !newCita.tipo_servicio) {
      Alert.alert('Error', 'Mascota, fecha, hora y tipo de servicio son requeridos');
      return;
    }

    try {
      const payload = {
        mascotaId: parseInt(newCita.mascota_id),
        fecha: newCita.fecha,
        hora: newCita.hora,
        motivo: newCita.tipo_servicio,
      };

      console.log('📤 Creando cita:', payload);
      const response = await fetch(`${getApiUrl()}/api/v1/citas`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('✅ Respuesta:', data);

      if (data.success) {
        Alert.alert('✅ Éxito', 'Cita creada correctamente');
        setCreateModalVisible(false);
        setNewCita({
          mascota_id: '',
          fecha: '',
          hora: '',
          tipo_servicio: '',
          descripcion: '',
        });
        fetchCitas();
      } else {
        Alert.alert('❌ Error', data.message || 'No se pudo crear la cita');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Error', 'Error al crear la cita');
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' };
      case 'confirmada':
        return { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' };
      case 'completada':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' };
      case 'cancelada':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.2)', text: '#9ca3af' };
    }
  };

  const renderCita = ({ item }: { item: Cita }) => {
    const estadoStyle = getEstadoStyle(item.estado);

    return (
      <TouchableOpacity style={styles.citaCard}>
        <View style={styles.citaHeader}>
          <View>
            <Text style={styles.clienteNombre}>{item.usuario_nombre}</Text>
            <View style={styles.mascotaContainer}>
              <Ionicons name="paw" size={14} color="#9ca3af" />
              <Text style={styles.mascotaNombre}>{item.mascota_nombre}</Text>
            </View>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg }]}>
            <Text style={[styles.estadoText, { color: estadoStyle.text }]}>
              {item.estado}
            </Text>
          </View>
        </View>

        <View style={styles.citaDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            <Text style={styles.detailText}>{item.fecha}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#9ca3af" />
            <Text style={styles.detailText}>{item.hora}</Text>
          </View>
        </View>

        <View style={styles.motivoContainer}>
          <Text style={styles.motivoLabel}>Tipo de Servicio:</Text>
          <Text style={styles.motivoText}>{item.tipo_servicio}</Text>
          {item.descripcion && (
            <Text style={styles.descripcionText}>{item.descripcion}</Text>
          )}
        </View>

        <View style={styles.citaActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditCita(item)}>
            <Ionicons name="create-outline" size={20} color="#7c3aed" />
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          {item.estado !== 'completada' && item.estado !== 'cancelada' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]} 
              onPress={() => handleCompletarCita(item)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              <Text style={[styles.actionBtnText, { color: '#10b981' }]}>Completar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={citas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyText}>No hay citas programadas</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Creación */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 Nueva Cita</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>ID de la Mascota *</Text>
              <TextInput
                style={styles.modalInput}
                value={newCita.mascota_id}
                onChangeText={(text) => setNewCita({ ...newCita, mascota_id: text })}
                placeholder="ID de la mascota"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Fecha (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalInput}
                value={newCita.fecha}
                onChangeText={(text) => setNewCita({ ...newCita, fecha: text })}
                placeholder="Ej: 2026-03-15"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.modalLabel}>Hora (HH:MM) *</Text>
              <TextInput
                style={styles.modalInput}
                value={newCita.hora}
                onChangeText={(text) => setNewCita({ ...newCita, hora: text })}
                placeholder="Ej: 14:30"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.modalLabel}>Tipo de Servicio *</Text>
              <View style={styles.pickerContainer}>
                {['Consulta General', 'Vacunación', 'Cirugía', 'Emergencia', 'Control', 'Baño y Estética'].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.estadoOption,
                      newCita.tipo_servicio === tipo && styles.estadoOptionSelected,
                    ]}
                    onPress={() => setNewCita({ ...newCita, tipo_servicio: tipo })}
                  >
                    <Text
                      style={[
                        styles.estadoOptionText,
                        newCita.tipo_servicio === tipo && styles.estadoOptionTextSelected,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Descripción / Motivo</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={newCita.descripcion}
                onChangeText={(text) => setNewCita({ ...newCita, descripcion: text })}
                placeholder="Descripción o motivo de la cita (opcional)"
                placeholderTextColor="#6b7280"
                multiline
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateCita}>
                <Text style={styles.saveButtonText}>✅ Crear Cita</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Cita #{selectedCita?.id}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Estado</Text>
              <View style={styles.pickerContainer}>
                {['pendiente', 'confirmada', 'completada', 'cancelada'].map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.estadoOption,
                      editData.estado === estado && styles.estadoOptionSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, estado })}
                  >
                    <Text
                      style={[
                        styles.estadoOptionText,
                        editData.estado === estado && styles.estadoOptionTextSelected,
                      ]}
                    >
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Costo (opcional)</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.costo}
                onChangeText={(text) => setEditData({ ...editData, costo: text })}
                placeholder="Ej: 50.00"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Notas del Admin (opcional)</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={editData.notas_admin}
                onChangeText={(text) => setEditData({ ...editData, notas_admin: text })}
                placeholder="Notas internas sobre la cita"
                placeholderTextColor="#6b7280"
                multiline
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateCita}>
                <Text style={styles.saveButtonText}>💾 Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  citaCard: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  mascotaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mascotaNombre: {
    fontSize: 14,
    color: '#9ca3af',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  citaDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  motivoContainer: {
    marginBottom: 12,
  },
  motivoLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  motivoText: {
    color: '#ffffff',
    fontSize: 14,
  },
  descripcionText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  citaActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    gap: 6,
  },
  actionBtnText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#7c3aed',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  estadoOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  estadoOptionSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  estadoOptionText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  estadoOptionTextSelected: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
