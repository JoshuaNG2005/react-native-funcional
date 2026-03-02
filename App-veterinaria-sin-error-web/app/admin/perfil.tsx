import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function AdminPerfilScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Perfil del Admin */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={['#7c3aed', '#a78bfa']}
          style={styles.avatarGradient}
        >
          <Ionicons name="shield-checkmark" size={64} color="#ffffff" />
        </LinearGradient>
        <Text style={styles.adminName}>{user?.nombre}</Text>
        <Text style={styles.adminEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Administrador</Text>
        </View>
      </View>

      {/* Opciones de Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-outline" size={24} color="#7c3aed" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Editar Perfil</Text>
            <Text style={styles.menuSubtitle}>Actualizar información personal</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Información del Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistema</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#06b6d4" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Acerca de</Text>
            <Text style={styles.menuSubtitle}>VetNova v1.0.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle-outline" size={24} color="#10b981" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Ayuda y Soporte</Text>
            <Text style={styles.menuSubtitle}>Contactar soporte técnico</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  roleText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
