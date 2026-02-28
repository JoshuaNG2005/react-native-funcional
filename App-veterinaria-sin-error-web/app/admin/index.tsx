import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import DashboardView from './dashboard';
import UsuariosView from './usuarios';
import CitasView from './citas';
import MascotasAdminView from './mascotas';
import PerfilView from './perfil';

type MenuOption = 'dashboard' | 'usuarios' | 'citas' | 'mascotas' | 'perfil';

export default function AdminIndex() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MenuOption>('dashboard');
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const navigateToView = (view: MenuOption) => {
    setCurrentView(view);
    toggleMenu();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/welcome');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return '🏥 Panel Administrativo';
      case 'usuarios':
        return '👥 Gestión de Usuarios';
      case 'citas':
        return '📅 Gestión de Citas';
      case 'mascotas':
        return '🐾 Gestión de Mascotas';
      case 'perfil':
        return '⚙️ Configuración';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'usuarios':
        return <UsuariosView />;
      case 'citas':
        return <CitasView />;
      case 'mascotas':
        return <MascotasAdminView />;
      case 'perfil':
        return <PerfilView />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con menú hamburger */}
      <LinearGradient
        colors={['#18181b', '#27272a']}
        style={styles.header}
      >
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getViewTitle()}</Text>
        <View style={styles.headerRight}>
          <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
        </View>
      </LinearGradient>

      {/* Contenido principal */}
      <View style={styles.content}>
        {renderCurrentView()}
      </View>

      {/* Menú lateral (Drawer) */}
      {menuOpen && (
        <Modal
          transparent
          visible={menuOpen}
          animationType="none"
          onRequestClose={toggleMenu}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleMenu}
          >
            <Animated.View
              style={[
                styles.drawerContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                {/* Header del menú */}
                <LinearGradient
                  colors={['#18181b', '#27272a']}
                  style={styles.drawerHeader}
                >
                  <View style={styles.drawerUserInfo}>
                    <View style={styles.drawerAvatar}>
                      <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
                    </View>
                    <Text style={styles.drawerUserName}>{user?.nombre}</Text>
                    <Text style={styles.drawerUserRole}>Administrador</Text>
                  </View>
                </LinearGradient>

                {/* Opciones del menú */}
                <View style={styles.drawerMenu}>
                  <TouchableOpacity
                    style={[
                      styles.drawerItem,
                      currentView === 'dashboard' && styles.drawerItemActive,
                    ]}
                    onPress={() => navigateToView('dashboard')}
                  >
                    <Ionicons
                      name="grid"
                      size={24}
                      color={currentView === 'dashboard' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        currentView === 'dashboard' && styles.drawerItemTextActive,
                      ]}
                    >
                      Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.drawerItem,
                      currentView === 'usuarios' && styles.drawerItemActive,
                    ]}
                    onPress={() => navigateToView('usuarios')}
                  >
                    <Ionicons
                      name="people"
                      size={24}
                      color={currentView === 'usuarios' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        currentView === 'usuarios' && styles.drawerItemTextActive,
                      ]}
                    >
                      Usuarios
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.drawerItem,
                      currentView === 'citas' && styles.drawerItemActive,
                    ]}
                    onPress={() => navigateToView('citas')}
                  >
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={currentView === 'citas' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        currentView === 'citas' && styles.drawerItemTextActive,
                      ]}
                    >
                      Citas
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.drawerItem,
                      currentView === 'mascotas' && styles.drawerItemActive,
                    ]}
                    onPress={() => navigateToView('mascotas')}
                  >
                    <Ionicons
                      name="paw"
                      size={24}
                      color={currentView === 'mascotas' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        currentView === 'mascotas' && styles.drawerItemTextActive,
                      ]}
                    >
                      Mascotas
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.drawerItem,
                      currentView === 'perfil' && styles.drawerItemActive,
                    ]}
                    onPress={() => navigateToView('perfil')}
                  >
                    <Ionicons
                      name="settings"
                      size={24}
                      color={currentView === 'perfil' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        currentView === 'perfil' && styles.drawerItemTextActive,
                      ]}
                    >
                      Configuración
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.drawerDivider} />

                  <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out" size={24} color="#ef4444" />
                    <Text style={[styles.drawerItemText, { color: '#ef4444' }]}>
                      Cerrar Sesión
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  drawerUserInfo: {
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  drawerUserRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerMenu: {
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 16,
    marginHorizontal: 20,
  },
});
