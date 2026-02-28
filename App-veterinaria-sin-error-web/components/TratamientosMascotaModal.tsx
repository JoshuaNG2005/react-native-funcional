import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, StyleSheet, ScrollView, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TratamientoItem {
  id: number;
  nombre: string;
  descripcion?: string;
  medicamento?: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: string;
  notas?: string;
}

interface Props {
  mascotaId: number;
  visible: boolean;
  onClose: () => void;
  nombreMascota: string;
}

const TratamientosMascotaModal: React.FC<Props> = ({ mascotaId, visible, onClose, nombreMascota }) => {
    const { token } = useAuth();
  const [tratamientos, setTratamientos] = useState<TratamientoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible && mascotaId) {
      fetchTratamientos();
    }
  }, [visible, mascotaId]);

  const fetchTratamientos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/v1/tratamientos/mascota/${mascotaId}`;
      
      console.log('🔍 Buscando tratamientos para mascota:', mascotaId);
      console.log('🌐 URL:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📡 Status respuesta:', response.status);
      
      if (!response.ok) {
        console.error('❌ Error en respuesta:', response.status);
        setErrorMsg('No se pudo conectar con el servidor. Intenta más tarde.');
        setTratamientos([]);
        return;
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`✅ ${data.data?.length || 0} tratamientos encontrados`);
        setTratamientos(data.data || []);
      } else {
        console.log('⚠️ No hay tratamientos:', data.message);
        setTratamientos([]);
        setErrorMsg(data.message || 'No se pudieron cargar los tratamientos.');
      }
    } catch (error) {
      console.error('❌ Error al cargar tratamientos:', error);
      setTratamientos([]);
      setErrorMsg('Error de red o autenticación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.modalContainer, { width: '95%', maxHeight: '85%', paddingTop: 12, paddingBottom: 12 }]}> 
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { alignSelf: 'center', marginBottom: 8 }]}>Tratamientos de {nombreMascota}</Text>
          <Text style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
            Aquí se muestran las citas programadas o en proceso como tratamientos activos.
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 40 }} />
          ) : errorMsg ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 16, marginTop: 16, textAlign: 'center' }}>{errorMsg}</Text>
            </View>
          ) : tratamientos.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="medkit-outline" size={48} color="#a1a1aa" />
              <Text style={{ color: '#a1a1aa', fontSize: 16, marginTop: 16 }}>No hay tratamientos activos para esta mascota.</Text>
              <Text style={{ color: '#a1a1aa', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                Los tratamientos se muestran aquí cuando agendas una cita programada o en proceso.
              </Text>
            </View>
          ) : (
            <ScrollView style={{ marginTop: 16 }}>
              {tratamientos.map((item) => {
                const estadoColor = item.estado === 'activo' ? '#34d399' : item.estado === 'completado' ? '#3b82f6' : '#ef4444';
                const estadoBg = item.estado === 'activo' ? '#34d39933' : item.estado === 'completado' ? '#3b82f633' : '#ef444433';
                
                return (
                  <View key={item.id} style={[styles.itemCard, { borderLeftWidth: 4, borderLeftColor: estadoColor }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="medkit" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>{item.nombre}</Text>
                      </View>
                      <View style={{ backgroundColor: estadoBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: estadoColor, fontSize: 11, fontWeight: '700' }}>
                          {item.estado.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {item.descripcion && (
                      <Text style={{ color: '#d4d4d8', fontSize: 14, marginBottom: 12, lineHeight: 20 }}>
                        {item.descripcion}
                      </Text>
                    )}

                    <View style={{ backgroundColor: '#27272a', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600', width: 100 }}>📅 Inicio:</Text>
                        <Text style={{ color: '#fff', fontSize: 13 }}>
                          {new Date(item.fecha_inicio).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                      {item.fecha_fin && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600', width: 100 }}>📅 Fin:</Text>
                          <Text style={{ color: '#fff', fontSize: 13 }}>
                            {new Date(item.fecha_fin).toLocaleDateString('es-ES')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.medicamento && (
                      <View style={{ backgroundColor: '#7c3aed22', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>💊 Medicamento:</Text>
                        <Text style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>{item.medicamento}</Text>
                        {item.dosis && (
                          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={{ color: '#a1a1aa', fontSize: 12 }}>Dosis: </Text>
                            <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600' }}>{item.dosis}</Text>
                          </View>
                        )}
                        {item.frecuencia && (
                          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={{ color: '#a1a1aa', fontSize: 12 }}>Frecuencia: </Text>
                            <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600' }}>{item.frecuencia}</Text>
                          </View>
                        )}
                        {item.duracion && (
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#a1a1aa', fontSize: 12 }}>Duración: </Text>
                            <Text style={{ color: '#d4d4d8', fontSize: 12, fontWeight: '600' }}>{item.duracion}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {item.notas && (
                      <View style={{ marginTop: 8, padding: 10, backgroundColor: '#27272a', borderRadius: 8 }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontStyle: 'italic' }}>
                          📝 {item.notas}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#a1a1aa',
  },
  itemCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
});

export default TratamientosMascotaModal;
