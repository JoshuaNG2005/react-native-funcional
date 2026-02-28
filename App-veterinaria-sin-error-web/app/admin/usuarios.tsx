import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal, Alert, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from 'expo-router';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  rol: string;
}

const getApiUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
};

export default function UsuariosScreen() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'cliente' as 'cliente' | 'admin',
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Recargar usuarios cuando la pantalla vuelve a estar en foco
      fetchUsuarios();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsuarios();
  };

  const filteredUsuarios = usuarios.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      rol: user.rol as 'cliente' | 'admin',
    });
    setEditModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.nombre || !formData.email) {
      Alert.alert('Error', 'Nombre y email son obligatorios');
      return;
    }

    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${getApiUrl()}/api/v1/users/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
        setEditModalVisible(false);
        fetchUsuarios();
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar el usuario');
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      Alert.alert('Error', 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar a ${selectedUser.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `${getApiUrl()}/api/v1/users/${selectedUser.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (data.success) {
                Alert.alert('Éxito', 'Usuario eliminado');
                setEditModalVisible(false);
                fetchUsuarios();
              } else {
                Alert.alert('Error', data.message || 'No se pudo eliminar');
              }
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              Alert.alert('Error', 'Error de conexión');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Ionicons 
          name={item.rol === 'admin' ? 'shield-checkmark' : 'person'} 
          size={28} 
          color={item.rol === 'admin' ? '#7c3aed' : '#38bdf8'} 
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.telefono}</Text>
      </View>
      <View style={styles.userActions}>
        <View style={[styles.roleBadge, item.rol === 'admin' ? styles.adminBadge : styles.clientBadge]}>
          <Text style={styles.roleText}>{item.rol}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditUser(item)}
        >
          <Ionicons name="create-outline" size={20} color="#7c3aed" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuario..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />

      {/* Contador */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Modal de edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#18181b', '#27272a']}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>✏️ Editar Usuario</Text>
            <View style={{ width: 28 }} />
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputContainerModal}>
                <Ionicons name="person" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.inputModal}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  placeholder="Nombre completo"
                  placeholderTextColor="#6b7280"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainerModal}>
                <Ionicons name="mail" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.inputModal}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputContainerModal}>
                <Ionicons name="call" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.inputModal}
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                  placeholder="1234-5678"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Dirección */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <View style={styles.inputContainerModal}>
                <Ionicons name="location" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.inputModal}
                  value={formData.direccion}
                  onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                  placeholder="Dirección completa"
                  placeholderTextColor="#6b7280"
                />
              </View>
            </View>

            {/* Rol */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rol de Usuario</Text>
              <View style={styles.rolContainer}>
                <TouchableOpacity
                  style={[
                    styles.rolOption,
                    formData.rol === 'cliente' && styles.rolOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, rol: 'cliente' })}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={formData.rol === 'cliente' ? '#38bdf8' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.rolText,
                      formData.rol === 'cliente' && styles.rolTextActive,
                    ]}
                  >
                    Cliente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rolOption,
                    formData.rol === 'admin' && styles.rolOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, rol: 'admin' })}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={formData.rol === 'admin' ? '#7c3aed' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.rolText,
                      formData.rol === 'admin' && styles.rolTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botones de acción */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveUser}
              disabled={loading}
            >
              <LinearGradient
                colors={['#7c3aed', '#a78bfa']}
                style={styles.saveButtonGradient}
              >
                <Ionicons name="save" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteUser}
              disabled={loading}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={styles.deleteButtonText}>Eliminar Usuario</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#6b7280',
  },
  userActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  clientBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7c3aed',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  // Estilos del modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 16,
    gap: 12,
  },
  inputModal: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 14,
  },
  rolContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rolOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27272a',
    paddingVertical: 16,
    gap: 8,
  },
  rolOptionActive: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  rolText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  rolTextActive: {
    color: '#7c3aed',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
