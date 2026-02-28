import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#18181b',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-user"
        options={{
          headerShown: true,
          headerTitle: '✏️ Editar Usuario',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
