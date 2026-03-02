import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 120,
    paddingHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginBottom: 8,
  },
  createButton: {
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function CitasScreen() {
  const motivosOpciones = [
    'Vacunación',
    'Consulta general',
    'Desparasitación',
    'Control',
    'Emergencia',
    'Cirugía',
    'Otro',
  ];
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showHourSelector, setShowHourSelector] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const getApiUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
  };

  const apiUrl = getApiUrl();

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/citas?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        // El backend devuelve { success: true, data: [...], citas: [...] }
        const citasArray = Array.isArray(data.data) ? data.data : Array.isArray(data.citas) ? data.citas : [];
        setCitas(citasArray);
        console.log('✅ Citas cargadas:', citasArray.length);
      } else {
        console.log('⚠️ Error al cargar citas:', data.message);
        setCitas([]);
      }
    } catch (error) {
      console.error('❌ Error de red al cargar citas:', error);
      setCitas([]);
    }
    setLoading(false);
  };

  const fetchMascotas = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/mascotas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      let mascotasArray = Array.isArray(data) ? data : Array.isArray(data.mascotas) ? data.mascotas : Array.isArray(data.data) ? data.data : [];
      setMascotas(mascotasArray.filter(m => m && m.id && m.nombre));
    } catch {
      setMascotas([]);
    }
  };

  const fetchHorariosDisponibles = async (fechaSeleccionada) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/citas/disponibilidad/${fechaSeleccionada}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('⚠️ Respuesta no es JSON, usando horarios por defecto');
        generarHorariosDefecto();
        return;
      }

      const data = await response.json();
      
      if (data.success && data.horarios) {
        setHorariosDisponibles(data.horarios);
        console.log('✅ Horarios cargados:', data.horarios.length);
      } else {
        console.log('⚠️ Respuesta sin horarios, usando por defecto');
        generarHorariosDefecto();
      }
    } catch (error) {
      console.log('⚠️ Error al obtener horarios, usando por defecto:', error.message);
      generarHorariosDefecto();
    }
  };

  const generarHorariosDefecto = () => {
    const horarios = [];
    for (let h = 8; h <= 20; h++) {
      horarios.push({ hora: `${h.toString().padStart(2, '0')}:00`, disponible: true });
      if (h < 20) horarios.push({ hora: `${h.toString().padStart(2, '0')}:30`, disponible: true });
    }
    setHorariosDisponibles(horarios);
  };

  const crearCita = async () => {
    console.log('🔄 Iniciando creación de cita...');
    // Obtenemos el ID de la mascota
    let mascotaIdNum = Number(selectedMascotaId);
    // Validar campos obligatorios
    if (!mascotaIdNum || !fecha || !hora || !motivo) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }
    // 1. AJUSTE DE PAYLOAD: Usamos los nombres exactos de tu base de datos
    const citaPayload = {
      mascotaId: mascotaIdNum,
      mascota_id: mascotaIdNum,
      fecha,
      hora,
      motivo,
      tipo_servicio: motivo,
      descripcion: notas || null,
      notas: notas || null,
      id_Medicos: 1,
    };
    console.log('📤 Enviando a API:', citaPayload);
    try {
      const response = await fetch(`${apiUrl}/api/v1/citas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(citaPayload),
      });
      const data = await response.json();
      if (response.ok) {
        await fetchCitas();
        Alert.alert('Éxito', '¡Tu cita ha sido agendada!');
        setCreateModalVisible(false);
        setSelectedMascotaId(null);
        setFecha('');
        setHora('');
        setMotivo('');
        setNotas('');
      } else {
        Alert.alert('Error', data.error || 'No se pudo crear la cita');
      }
    } catch (err) {
      Alert.alert('Error de conexión', 'Asegúrate de que la URL de la API sea correcta');
    }
  };

  useEffect(() => {
    fetchCitas();
    fetchMascotas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCitas().then(() => setRefreshing(false));
  };

  const completarCita = async (citaId) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/citas/${citaId}/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Cita completada. Ahora puedes ver el tratamiento.');
        await fetchCitas();
        router.push('/(tabs)/tratamientos');
      } else {
        Alert.alert('Error', data.message || 'No se pudo completar la cita');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la cita');
    }
  };

  const cancelarCita = async (citaId) => {
    Alert.alert('Cancelar Cita', '¿Estás seguro de que deseas cancelar esta cita?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Sí, cancelar',
        onPress: async () => {
          try {
            const response = await fetch(`${apiUrl}/api/v1/citas/${citaId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const data = await response.json();
            if (response.ok) {
              Alert.alert('Éxito', 'Cita cancelada');
              await fetchCitas();
            } else {
              Alert.alert('Error', data.message || 'No se pudo cancelar la cita');
            }
          } catch (error) {
            Alert.alert('Error', 'No se pudo cancelar la cita');
          }
        }
      }
    ]);
  };

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getAvailableHours = () => {
    const hours = [];
    for (let h = 8; h <= 20; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 20) hours.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return hours;
  };

  const renderCita = ({ item }) => {
    const estadoColors = {
      pendiente: { bg: '#fbbf2433', text: '#fbbf24', icon: '⏳' },
      confirmada: { bg: '#3b82f633', text: '#3b82f6', icon: '✓' },
      completada: { bg: '#34d39933', text: '#34d399', icon: '✓✓' },
      cancelada: { bg: '#ef444433', text: '#ef4444', icon: '✗' }
    };
    
    const estadoColor = estadoColors[item?.estado] || estadoColors.pendiente;
    
    return (
      <View style={{ marginBottom: 18, backgroundColor: '#18181b', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#27272a' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>
              🐾 {item?.mascota_nombre || 'Mascota'}
            </Text>
            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>
              {item?.mascota_tipo || 'Tipo'}
            </Text>
          </View>
          <View style={{ 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            backgroundColor: estadoColor.bg,
            borderRadius: 8,
          }}>
            <Text style={{ 
              color: estadoColor.text,
              fontSize: 12,
              fontWeight: '700'
            }}>
              {estadoColor.icon} {item?.estado?.toUpperCase() || 'ESTADO'}
            </Text>
          </View>
        </View>
        
        <View style={{ backgroundColor: '#27272a', borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#a78bfa', fontSize: 14, fontWeight: '600', marginRight: 8 }}>📅 Fecha:</Text>
            <Text style={{ color: '#fff', fontSize: 15 }}>
              {item?.fecha ? new Date(item.fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Sin fecha'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#a78bfa', fontSize: 14, fontWeight: '600', marginRight: 8 }}>⏰ Hora:</Text>
            <Text style={{ color: '#fff', fontSize: 15 }}>
              {item?.hora ? item.hora.substring(0, 5) : 'Sin hora'}
            </Text>
          </View>
        </View>
        
        {item?.estado === 'pendiente' && (
          <View style={{ 
            backgroundColor: '#0ea5e922', 
            borderRadius: 8, 
            padding: 10,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#0ea5e9'
          }}>
            <Text style={{ color: '#7dd3fc', fontSize: 13, fontWeight: '600' }}>
              ℹ️ Presentarse 10 minutos antes de su cita
            </Text>
          </View>
        )}
        
        <View style={{ 
          backgroundColor: '#7c3aed22', 
          borderRadius: 12, 
          padding: 12,
          borderLeftWidth: 3,
          borderLeftColor: '#7c3aed'
        }}>
          <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
            Servicio:
          </Text>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
            {item?.tipo_servicio || 'Tipo de servicio'}
          </Text>
        </View>
        
        {item?.descripcion && (
          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#27272a', borderRadius: 12 }}>
            <Text style={{ color: '#a1a1aa', fontSize: 13, fontStyle: 'italic' }}>
              💬 {item.descripcion}
            </Text>
          </View>
        )}
        
        {item?.costo && (
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            <Text style={{ color: '#34d399', fontSize: 18, fontWeight: 'bold' }}>
              ${Number(item.costo).toFixed(2)}
            </Text>
          </View>
        )}

        {item?.estado === 'pendiente' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
              onPress={() => completarCita(item.id)}
            >
              <LinearGradient
                colors={['#34d399', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                  ✓ Completar
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#ef444433' }}
              onPress={() => cancelarCita(item.id)}
            >
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>
                  ✕ Cancelar
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  function RenderEmpty() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>¡No tienes citas aún!</Text>
        <Text style={{ color: '#a1a1aa', fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 16 }}>Cuando agendes una cita, aparecerá aquí para que la gestiones fácilmente.</Text>
        <Text style={{ color: '#7dd3fc', fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>📌 Recuerda presentarte 10 minutos antes de tu cita</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={citas}
        renderItem={renderCita}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={RenderEmpty}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
        disabled={mascotas.length === 0}
      >
        <LinearGradient
          colors={['#7c3aed', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Cita</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Mascota *</Text>
              <View>
                {mascotas.length === 0 ? (
                  <Text style={{ color: '#f87171', fontSize: 16 }}>No tienes mascotas registradas.</Text>
                ) : (
                  mascotas.map((mascota) => (
                    <TouchableOpacity
                      key={mascota.id}
                      style={{ padding: 12, backgroundColor: selectedMascotaId === mascota.id ? '#7c3aed33' : '#27272a', borderRadius: 12, marginBottom: 8 }}
                      onPress={() => setSelectedMascotaId(mascota.id)}
                    >
                      <Text style={{ color: '#fff', fontWeight: selectedMascotaId === mascota.id ? 'bold' : 'normal' }}>{mascota.nombre} ({mascota.tipo})</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
              <Text style={styles.label}>Fecha *</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDateSelector(true)}>
                <Text style={{ color: fecha ? '#fff' : '#71717a', fontSize: 16 }}>{fecha || 'Selecciona una fecha'}</Text>
              </TouchableOpacity>
              <Modal visible={showDateSelector} transparent animationType="fade">
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center', alignItems:'center' }}>
                  <View style={{ backgroundColor:'#18181b', borderRadius:16, padding:20, width:'90%', maxHeight:'70%' }}>
                    <Text style={{ color:'#fff', fontSize:20, fontWeight:'bold', marginBottom:16 }}>📅 Selecciona una fecha</Text>
                    <ScrollView style={{ maxHeight:400 }}>
                      {getAvailableDates().map(d => (
                        <TouchableOpacity 
                          key={d} 
                          style={{ 
                            padding:16, 
                            backgroundColor: fecha === d ? '#7c3aed' : '#27272a',
                            borderRadius:12,
                            marginBottom:8,
                            borderWidth: 1,
                            borderColor: fecha === d ? '#a78bfa' : '#3f3f46'
                          }} 
                          onPress={async () => { 
                            setFecha(d); 
                            setHora(''); 
                            await fetchHorariosDisponibles(d);
                            setShowDateSelector(false);
                          }}
                        >
                          <Text style={{ color:'#fff', fontSize:16, fontWeight: fecha === d ? 'bold' : 'normal' }}>
                            {new Date(d).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setShowDateSelector(false)} style={{ marginTop:16, alignSelf:'flex-end' }}>
                      <Text style={{ color:'#a78bfa', fontWeight:'bold', fontSize:16 }}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Text style={styles.label}>Hora *</Text>
              <TouchableOpacity style={styles.input} onPress={() => fecha && setShowHourSelector(true)} disabled={!fecha}>
                <Text style={{ color: hora ? '#fff' : '#71717a', fontSize: 16 }}>{hora || (fecha ? 'Selecciona una hora' : 'Primero selecciona fecha')}</Text>
              </TouchableOpacity>
              <Modal visible={showHourSelector} transparent animationType="fade">
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center', alignItems:'center' }}>
                  <View style={{ backgroundColor:'#18181b', borderRadius:16, padding:20, width:'90%', maxHeight:'70%' }}>
                    <Text style={{ color:'#fff', fontSize:20, fontWeight:'bold', marginBottom:8 }}>⏰ Selecciona una hora</Text>
                    <Text style={{ color:'#a1a1aa', fontSize:14, marginBottom:16 }}>Cada cita dura 30 minutos</Text>
                    <ScrollView style={{ maxHeight:400 }}>
                      {(horariosDisponibles.length > 0 ? horariosDisponibles : getAvailableHours().map(h => ({ hora: h, disponible: true }))).map(horario => (
                        <TouchableOpacity 
                          key={horario.hora} 
                          style={{ 
                            padding:16, 
                            backgroundColor: !horario.disponible ? '#3f3f46' : hora === horario.hora ? '#7c3aed' : '#27272a',
                            borderRadius:12,
                            marginBottom:8,
                            borderWidth: 1,
                            borderColor: !horario.disponible ? '#52525b' : hora === horario.hora ? '#a78bfa' : '#3f3f46',
                            opacity: !horario.disponible ? 0.5 : 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }} 
                          onPress={() => {
                            if (horario.disponible) {
                              setHora(horario.hora);
                              setShowHourSelector(false);
                            }
                          }}
                          disabled={!horario.disponible}
                        >
                          <Text style={{ color:'#fff', fontSize:18, fontWeight: hora === horario.hora ? 'bold' : 'normal' }}>
                            {horario.hora}
                          </Text>
                          {!horario.disponible && (
                            <Text style={{ color:'#f87171', fontSize:12, fontWeight:'600' }}>
                              ❌ OCUPADO
                            </Text>
                          )}
                          {horario.disponible && hora !== horario.hora && (
                            <Text style={{ color:'#34d399', fontSize:12, fontWeight:'600' }}>
                              ✓ Disponible
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setShowHourSelector(false)} style={{ marginTop:16, alignSelf:'flex-end' }}>
                      <Text style={{ color:'#a78bfa', fontWeight:'bold', fontSize:16 }}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Text style={styles.label}>Motivo *</Text>
              <View>
                {motivosOpciones.map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={{ padding: 12, backgroundColor: motivo === opcion ? '#7c3aed33' : '#27272a', borderRadius: 12, marginBottom: 8 }}
                    onPress={() => setMotivo(opcion)}
                  >
                    <Text style={{ color: '#fff', fontWeight: motivo === opcion ? 'bold' : 'normal' }}>{opcion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Notas adicionales</Text>
              <TextInput
                style={styles.input}
                value={notas}
                onChangeText={setNotas}
                placeholder="Información adicional..."
                placeholderTextColor="#71717a"
                multiline
              />
              <TouchableOpacity
                style={[styles.createButton, (!selectedMascotaId || !fecha || !hora || !motivo) && styles.createButtonDisabled]}
                onPress={crearCita}
                disabled={!selectedMascotaId || !fecha || !hora || !motivo}
              >
                <LinearGradient
                  colors={['#7c3aed', '#a78bfa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Agregar Cita</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}



