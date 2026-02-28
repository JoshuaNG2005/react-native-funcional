import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface UserMenuProps {
  collapsed?: boolean;
}

export default function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    console.log('handleLogout called');
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      console.log('Web confirm result:', confirmed);
      if (confirmed) {
        setIsOpen(false);
        console.log('Calling logout...');
        await logout();
        console.log('Logout completed, redirecting...');
        router.replace('/login');
      }
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        [
          { text: 'Cancelar', onPress: () => setIsOpen(false) },
          {
            text: 'Cerrar sesión',
            onPress: async () => {
              setIsOpen(false);
              await logout();
              router.replace('/login');
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handleNavigateToProfile = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  if (collapsed) {
    return (
      <View style={styles.collapsedContainer}>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={styles.userButtonText}>👤</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNavigateToProfile}
            >
              <Text style={styles.menuItemText}>👤 Mi Perfil</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={[styles.menuItemText, styles.logoutText]}>🚪 Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.nombre}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNavigateToProfile}
        >
          <Text style={styles.actionButtonText}>👤 Mi Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutActionButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, styles.logoutActionText]}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoutActionButton: {
    backgroundColor: '#ffe0e0',
  },
  logoutActionText: {
    color: '#ff6b6b',
  },
  // Collapsed menu styles
  collapsedContainer: {
    position: 'relative',
  },
  userButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userButtonText: {
    fontSize: 24,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    pad: 0,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  logoutText: {
    color: '#ff6b6b',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
