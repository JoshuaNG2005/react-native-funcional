import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, StyleSheet, ScrollView, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface HistorialItem {
  id: number;
  fecha: string;
  tipo_servicio: string;
  descripcion?: string;
  diagnostico?: string;
  tratamiento?: string;
  veterinario?: string;
  costo?: number;
}

interface Props {
  mascotaId: number;
  visible: boolean;
  onClose: () => void;
  nombreMascota: string;
}

const HistorialMascotaModal: React.FC<Props> = ({ mascotaId, visible, onClose, nombreMascota }) => {
    const { token } = useAuth();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible && mascotaId) {
      fetchHistorial();
    }
  }, [visible, mascotaId]);

  const fetchHistorial = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/v1/historial/mascota/${mascotaId}`;
      
      console.log('🔍 Buscando historial médico para mascota:', mascotaId);
      console.log('🌐 URL:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('📡 Status respuesta:', response.status);
      
      if (!response.ok) {
        console.error('❌ Error en respuesta:', response.status);
        setHistorial([]);
        setErrorMsg('No se pudo conectar con el servidor. Intenta más tarde.');
        return;
      }
      
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`✅ ${data.data?.length || 0} registros de historial encontrados`);
        setHistorial(data.data || []);
      } else if (data.message && (data.message.toLowerCase().includes('token') || data.message.toLowerCase().includes('autoriz'))) {
        console.log('⚠️ Error de autenticación');
        setHistorial([]);
        setErrorMsg('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      } else {
        console.log('⚠️ No hay historial:', data.message);
        setHistorial([]);
        setErrorMsg(data.message || 'No se pudo cargar el historial.');
      }
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      setHistorial([]);
      setErrorMsg('No se pudo conectar con el servidor. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Historial médico de {nombreMascota}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
            Este historial muestra solo las citas completadas de la mascota.
          </Text>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          ) : errorMsg ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 16, marginTop: 16, textAlign: 'center' }}>{errorMsg}</Text>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {historial.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Ionicons name="document-text-outline" size={48} color="#a1a1aa" />
                  <Text style={{ color: '#a1a1aa', fontSize: 16, marginTop: 16 }}>No hay historial médico registrado para esta mascota.</Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                    El historial se genera automáticamente cuando una cita es marcada como completada.
                  </Text>
                </View>
              ) : (
                historial.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <LinearGradient colors={["#10b981", "#059669"]} style={{ padding: 8, borderRadius: 8, marginRight: 12 }}>
                        <Ionicons name="document-text" size={20} color="#fff" />
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                          {item.tipo_servicio}
                        </Text>
                        <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>
                          📅 {new Date(item.fecha).toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                    </View>

                    {item.descripcion && (
                      <View style={{ backgroundColor: '#27272a', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: '#a78bfa', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                          📋 Descripción:
                        </Text>
                        <Text style={{ color: '#d4d4d8', fontSize: 14, lineHeight: 20 }}>
                          {item.descripcion}
                        </Text>
                      </View>
                    )}

                    {item.diagnostico && (
                      <View style={{ backgroundColor: '#10b98122', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                          🔬 Diagnóstico:
                        </Text>
                        <Text style={{ color: '#d4d4d8', fontSize: 14, lineHeight: 20 }}>
                          {item.diagnostico}
                        </Text>
                      </View>
                    )}

                    {item.tratamiento && (
                      <View style={{ backgroundColor: '#3b82f622', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                          💊 Tratamiento aplicado:
                        </Text>
                        <Text style={{ color: '#d4d4d8', fontSize: 14, lineHeight: 20 }}>
                          {item.tratamiento}
                        </Text>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      {item.veterinario && (
                        <Text style={{ color: '#a1a1aa', fontSize: 12 }}>
                          👨‍⚕️ {item.veterinario}
                        </Text>
                      )}
                      {item.costo && item.costo > 0 && (
                        <Text style={{ color: '#34d399', fontSize: 16, fontWeight: 'bold' }}>
                          ${Number(item.costo).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#a1a1aa',
  },
  content: {
    maxHeight: '70%',
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
});

export default HistorialMascotaModal;
