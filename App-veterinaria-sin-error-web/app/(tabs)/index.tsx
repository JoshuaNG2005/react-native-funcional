import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

import HomeView from './home';
import CitasView from './citas';
import MascotasView from './mascotas';
import TratamientosView from './tratamientos';
import HistorialView from './historial';
import ProfileScreen from './profile';

export default function ClientScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentView, setCurrentView] = useState('inicio');
  const [slideAnim] = useState(new Animated.Value(-300));

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    }
  };

  const navigateToView = (view: string) => {
    setCurrentView(view);
    closeMenu();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'inicio': return 'Inicio';
      case 'mascotas': return 'Mis Mascotas';
      case 'citas': return 'Mis Citas';
      case 'tratamientos': return 'Tratamientos';
      case 'historial': return 'Historial Médico';
      case 'perfil': return 'Mi Perfil';
      default: return 'VetNova';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'inicio':
        return <HomeView onNavigate={navigateToView} />;
      case 'mascotas':
        return <MascotasView />;
      case 'citas':
        return <CitasView />;
      case 'tratamientos':
        return <TratamientosView />;
      case 'historial':
        return <HistorialView />;
      case 'perfil':
        return <ProfileScreen />;
      default:
        return <HomeView onNavigate={navigateToView} />;
    }
  };

  const menuItems = [
    { id: 'inicio', icon: 'home', label: 'Inicio' },
    { id: 'mascotas', icon: 'paw', label: 'Mis Mascotas' },
    { id: 'citas', icon: 'calendar', label: 'Mis Citas' },
    { id: 'tratamientos', icon: 'medical', label: 'Tratamientos' },
    { id: 'historial', icon: 'document-text', label: 'Historial Médico' },
    { id: 'perfil', icon: 'person', label: 'Mi Perfil' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#18181b', '#27272a', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={toggleMenu}
            >
              <Ionicons name="menu" size={46} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>{getViewTitle()}</Text>
            </View>
            <View style={styles.pawContainer}>
              <Ionicons name="paw" size={28} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {renderCurrentView()}
      </View>

      {/* Menu Drawer */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <LinearGradient
                colors={['#18181b', '#27272a']}
                style={styles.drawerHeader}
              >
                <View style={styles.userAvatar}>
                  <Ionicons name="person-circle" size={60} color="#7c3aed" />
                </View>
                <Text style={styles.userName}>{user?.nombre}</Text>
                <Text style={styles.userRole}>Cliente</Text>
              </LinearGradient>

              <View style={styles.menuList}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      currentView === item.id && styles.menuItemActive,
                    ]}
                    onPress={() => navigateToView(item.id)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={currentView === item.id ? '#7c3aed' : '#a1a1aa'}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        currentView === item.id && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={24} color="#ef4444" />
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  header: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  menuButton: {
    padding: 10,
    width: 66,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pawContainer: {
    width: 66,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#27272a',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userAvatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  menuList: {
    padding: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#3f3f46',
  },
  menuItemText: {
    fontSize: 16,
    color: '#a1a1aa',
    marginLeft: 16,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#3f3f46',
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 16,
    fontWeight: '600',
  },
});

