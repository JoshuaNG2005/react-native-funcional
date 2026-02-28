import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';

const getApiUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
};

export default function EditUserScreen() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'cliente' as 'cliente' | 'admin',
  });

  useEffect(() => {
    if (params.nombre) {
      setFormData({
        nombre: params.nombre as string || '',
        email: params.email as string || '',
        telefono: params.telefono as string || '',
        direccion: params.direccion as string || '',
        rol: (params.rol as string || 'cliente') as 'cliente' | 'admin',
      });
    }
  }, [params]);

  const handleSave = async () => {
    if (!formData.nombre || !formData.email) {
      Alert.alert('Error', 'Nombre y email son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${getApiUrl()}/api/v1/users/${userId}`,
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
        Alert.alert('Éxito', 'Usuario actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
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

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar a ${formData.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `https://api-express-mysql-de-jime.onrender.com/api/v1/users/${userId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (data.success) {
                Alert.alert('Éxito', 'Usuario eliminado', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
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
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
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
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
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
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
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
            onPress={handleSave}
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
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Eliminar Usuario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
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
