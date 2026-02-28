import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
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
      if (Platform.OS === 'web') {
        alert('Perfil actualizado correctamente');
      } else {
        Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente');
      }
      setIsEditing(false);
    } else {
      if (Platform.OS === 'web') {
        alert('Error: No se pudo actualizar el perfil');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileCard}>
          {!isEditing ? (
            <>
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color="#7c3aed" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Nombre</Text>
                    <Text style={styles.value}>{user?.nombre}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#38bdf8" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color="#10b981" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Teléfono</Text>
                    <Text style={styles.value}>{user?.telefono || 'No asignado'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#f59e0b" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Dirección</Text>
                    <Text style={styles.value}>{user?.direccion || 'No asignada'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark" size={20} color="#8b5cf6" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Tipo de Usuario</Text>
                    <Text style={[styles.value, styles.roleText]}>
                      {user?.rol === 'admin' ? 'Administrador' : 'Cliente'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editButtonWrapper}
                onPress={() => setIsEditing(true)}
              >
                <LinearGradient
                  colors={['#7c3aed', '#a78bfa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Editar Perfil</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Nombre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Tu nombre"
                    placeholderTextColor="#71717a"
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Email</Text>
                <View style={[styles.inputContainer, styles.disabledInputContainer]}>
                  <Ionicons name="mail" size={18} color="#52525b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={email}
                    editable={false}
                    placeholder="Tu email"
                    placeholderTextColor="#52525b"
                  />
                </View>
                <Text style={styles.helperText}>El email no se puede cambiar</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={18} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="Tu teléfono"
                    keyboardType="phone-pad"
                    placeholderTextColor="#71717a"
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Dirección</Text>
                <View style={[styles.inputContainer, styles.multilineContainer]}>
                  <Ionicons name="location" size={18} color="#a1a1aa" style={[styles.inputIcon, styles.inputIconTop]} />
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={direccion}
                    onChangeText={setDireccion}
                    placeholder="Tu dirección"
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#71717a"
                  />
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.saveButtonWrapper}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveButton}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditing(false)}
                >
                  <Ionicons name="close-circle" size={20} color="#a1a1aa" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  infoSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  roleText: {
    color: '#a78bfa',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  disabledInputContainer: {
    backgroundColor: '#1c1c1e',
    borderColor: '#27272a',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconTop: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  disabledInput: {
    color: '#71717a',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  helperText: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonGroup: {
    marginTop: 8,
    gap: 12,
  },
  saveButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#3f3f46',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  editButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
