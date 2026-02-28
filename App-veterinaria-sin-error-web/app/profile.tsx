import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    setLoading(true);
    const result = await updateProfile({
      nombre,
      email,
      telefono,
      direccion,
    });
    setLoading(false);

    if (result) {
      Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente');
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar sesión',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Perfil de Usuario</Text>
      </View>

      <View style={styles.profileCard}>
        {!isEditing ? (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{user?.nombre}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{user?.telefono || 'No asignado'}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Dirección</Text>
              <Text style={styles.value}>{user?.direccion || 'No asignada'}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Tipo de Usuario</Text>
              <Text style={[styles.value, styles.roleText]}>
                {user?.rol === 'admin' ? '🔑 Administrador' : '👤 Cliente'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✎ Editar Perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.formSection}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                placeholder="Tu email"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Tu teléfono"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Tu dirección"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? '⏳ Guardando...' : '✓ Guardar Cambios'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>✕ Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  roleText: {
    fontSize: 14,
    color: '#667eea',
  },
  formSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    color: '#333',
  },
  editButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
