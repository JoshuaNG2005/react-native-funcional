import React from 'react';
import { View, Text } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const inAdminPanel = segments[0] === 'admin';

    // Si no hay usuario y no está en pantallas de auth, ir a login
    if (!user && !inAuthGroup && !inAdminPanel) {
      router.replace('/login');
    } 
    // Si hay usuario y está en pantallas de auth, redirigir según rol
    else if (user && inAuthGroup) {
      if (user.rol === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
    // Si no hay usuario pero está en admin panel, redirigir a login
    else if (!user && inAdminPanel) {
      router.replace('/login');
    }
  }, [user, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 24, color: '#7c3aed', fontWeight: 'bold' }}>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
