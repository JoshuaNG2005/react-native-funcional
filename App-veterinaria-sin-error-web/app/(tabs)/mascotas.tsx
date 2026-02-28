import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

import HistorialMascotaModal from '../../components/HistorialMascotaModal';
import TratamientosMascotaModal from '../../components/TratamientosMascotaModal';

interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza?: string;
  edad?: number;
  peso?: number;
  color?: string;
}

const TIPOS_ANIMALES = ['Perro', 'Gato', 'Ave', 'Pez', 'Conejo', 'Hamster', 'Reptil', 'Otro'];

export default function MascotasView() {
  const { token, user } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  // Modales de historial y tratamientos
  const [historialModalVisible, setHistorialModalVisible] = useState(false);
  const [tratamientosModalVisible, setTratamientosModalVisible] = useState(false);
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(null);
  const [selectedMascotaNombre, setSelectedMascotaNombre] = useState<string>('');
  // Form fields
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);

  const getApiUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
  };

  const fetchMascotas = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/mascotas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMascotas(data.data);
      } else if (Array.isArray(data)) {
        setMascotas(data);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMascotas();
  };

  const openModal = (mascota?: Mascota) => {
    // Primero limpiar todo
    setEditingMascota(null);
    setNombre('');
    setTipo('');
    setRaza('');
    setEdad('');
    setPeso('');
    setColor('');
    // Si hay mascota, cargar sus datos
    if (mascota && mascota.id) {
      setEditingMascota(mascota);
      setNombre(mascota.nombre);
      setTipo(mascota.tipo);
      setRaza(mascota.raza || '');
      setEdad(mascota.edad?.toString() || '');
      setPeso(mascota.peso?.toString() || '');
      setColor(mascota.color || '');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMascota(null);
    setNombre('');
    setTipo('');
    setRaza('');
    setEdad('');
    setPeso('');
    setColor('');
  };

  const handleSave = async () => {
    if (!nombre.trim() || !tipo.trim()) {
      Alert.alert('Error', 'Nombre y tipo son obligatorios');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        nombre: nombre.trim(),
        tipo: tipo.trim(), // En MySQL la columna es 'tipo', no 'especie'
        raza: raza.trim() || null,
        edad: edad ? parseInt(edad) : null,
        peso: peso ? parseFloat(peso) : null,
        color: color.trim() || null,
        usuario_id: user?.id || (user as any)?.userId || null,
      };
      const apiUrl = getApiUrl();
      const url = editingMascota
        ? `${apiUrl}/api/v1/mascotas/${editingMascota.id}`
        : `${apiUrl}/api/v1/mascotas`;
      console.log('Enviando petición:', {
        url,
        method: editingMascota ? 'PUT' : 'POST',
        body,
        hasToken: !!token
      });
      const response = await fetch(url, {
        method: editingMascota ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      console.log('Respuesta status:', response.status);
      const data = await response.json();
      console.log('Respuesta data:', data);
      if (data.success) {
        Alert.alert('Éxito', editingMascota ? 'Mascota actualizada' : 'Mascota registrada');
        closeModal();
        fetchMascotas();
      } else {
        const errorMsg = data.message || 'Error desconocido al guardar mascota';
        console.error('Error del servidor:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error al guardar mascota:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo conectar con el servidor';
      Alert.alert('Error', `No se pudo guardar la mascota: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('perro')) return 'paw';
    if (tipoLower.includes('gato')) return 'paw';
    if (tipoLower.includes('ave') || tipoLower.includes('pájaro')) return 'egg';
    if (tipoLower.includes('pez')) return 'fish';
    return 'paw';
  };

  const getTipoColor = (tipo: string): readonly [string, string] => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('perro')) return ['#f59e0b', '#f97316'] as const;
    if (tipoLower.includes('gato')) return ['#8b5cf6', '#a78bfa'] as const;
    if (tipoLower.includes('ave')) return ['#38bdf8', '#0ea5e9'] as const;
    if (tipoLower.includes('pez')) return ['#06b6d4', '#0891b2'] as const;
    return ['#10b981', '#059669'] as const;
  };

  const renderMascota = ({ item }: { item: Mascota }) => (
    <View style={styles.mascotaCardWrapper}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => openModal(item)}
      >
        <LinearGradient
          colors={getTipoColor(item.tipo)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mascotaCard}
        >
          <View style={styles.mascotaHeader}>
            <Ionicons name={getTipoIcon(item.tipo) as any} size={40} color="#fff" />
            <View style={styles.mascotaInfo}>
              <Text style={styles.mascotaNombre}>{item.nombre}</Text>
              <Text style={styles.mascotaTipo}>{item.tipo}</Text>
            </View>
          </View>
          <View style={styles.mascotaDetails}>
            {item.raza && (
              <View style={styles.detailRow}>
                <Ionicons name="paw" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>Raza: {item.raza}</Text>
              </View>
            )}
            {item.edad !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>Edad: {item.edad} {item.edad === 1 ? 'año' : 'años'}</Text>
              </View>
            )}
            {item.peso !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="scale" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>Peso: {item.peso} kg</Text>
              </View>
            )}
            {item.color && (
              <View style={styles.detailRow}>
                <Ionicons name="color-palette" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>Color: {item.color}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      {/* Botones de acciones */}
      <View style={styles.mascotaActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedMascotaId(item.id);
            setSelectedMascotaNombre(item.nombre);
            setHistorialModalVisible(true);
          }}
        >
          <Ionicons name="document-text" size={18} color="#10b981" />
          <Text style={styles.actionButtonText}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedMascotaId(item.id);
            setSelectedMascotaNombre(item.nombre);
            setTratamientosModalVisible(true);
          }}
        >
          <Ionicons name="medical" size={18} color="#f59e0b" />
          <Text style={styles.actionButtonText}>Tratamientos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando mascotas...</Text>
      </View>
    );
  }

  if (mascotas.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#38bdf8', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="paw" size={60} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No tienes mascotas registradas</Text>
          <Text style={styles.emptyText}>
            Presiona el botón "Nueva Mascota" para agregar tu primera mascota
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.floatingButton}
          activeOpacity={0.8}
          onPress={() => openModal()}
        >
          <LinearGradient
            colors={['#7c3aed', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
            <Text style={styles.floatingButtonText}>Nueva Mascota</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre de tu mascota"
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Tipo *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipoSelector}>
                {TIPOS_ANIMALES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tipoButton, tipo === t && styles.tipoButtonActive]}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={styles.tipoButtonText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                value={raza}
                onChangeText={setRaza}
                placeholder="Ej: Labrador, Siamés, etc."
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Edad (años)</Text>
              <TextInput
                style={styles.input}
                value={edad}
                onChangeText={setEdad}
                placeholder="Edad en años"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={peso}
                onChangeText={setPeso}
                placeholder="Peso en kilogramos"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="Color principal"
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={saving}
              >
                <LinearGradient
                  colors={saving ? ['#666', '#444'] : ['#7c3aed', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mascotas}
        renderItem={renderMascota}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
      />
      <TouchableOpacity 
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={() => openModal()}
      >
        <LinearGradient
          colors={['#7c3aed', '#06b6d4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.floatingButtonText}>Nueva Mascota</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de tu mascota"
              placeholderTextColor="#666"
            />
            <Text style={styles.label}>Tipo *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipoSelector}>
              {TIPOS_ANIMALES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoButton, tipo === t && styles.tipoButtonActive]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={styles.tipoButtonText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Raza</Text>
            <TextInput
              style={styles.input}
              value={raza}
              onChangeText={setRaza}
              placeholder="Ej: Labrador, Siamés, etc."
              placeholderTextColor="#666"
            />
            <Text style={styles.label}>Edad (años)</Text>
            <TextInput
              style={styles.input}
              value={edad}
              onChangeText={setEdad}
              placeholder="Edad en años"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              placeholder="Peso en kilogramos"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="Color principal"
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={saving ? ['#666', '#444'] : ['#7c3aed', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      {/* Modal de Historial */}
      {selectedMascotaId && (
        <HistorialMascotaModal
          mascotaId={selectedMascotaId}
          visible={historialModalVisible}
          onClose={() => setHistorialModalVisible(false)}
          nombreMascota={selectedMascotaNombre}
        />
      )}
      {/* Modal de Tratamientos */}
      {selectedMascotaId && (
        <TratamientosMascotaModal
          mascotaId={selectedMascotaId}
          visible={tratamientosModalVisible}
          onClose={() => setTratamientosModalVisible(false)}
          nombreMascota={selectedMascotaNombre}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  mascotaCardWrapper: {
    marginBottom: 16,
  },
  mascotaCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mascotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mascotaInfo: {
    marginLeft: 16,
    flex: 1,
  },
  mascotaNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  mascotaTipo: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  mascotaDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#27272a',
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  tipoSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipoButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginRight: 8,
  },
  tipoButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  tipoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3f3f46',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mascotaActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#3f3f46',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
