import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import HistorialMascotaModal from '../../components/HistorialMascotaModal';

interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
}
export default function HistorialView() {
  const { token } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);

  const fetchMascotas = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://veterinaria-backend-virid.vercel.app';
      const response = await fetch(`${apiUrl}/api/v1/mascotas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMascotas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Cargando mascotas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona una mascota para ver historial médico</Text>
      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mascotaCard}
            onPress={() => setSelectedMascota(item)}
          >
            <Ionicons name="paw" size={28} color="#10b981" />
            <Text style={styles.mascotaNombre}>{item.nombre} ({item.tipo})</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      {selectedMascota && (
        <HistorialMascotaModal
          mascotaId={selectedMascota.id}
          visible={!!selectedMascota}
          onClose={() => setSelectedMascota(null)}
          nombreMascota={selectedMascota.nombre}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#18181b',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  mascotaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
    gap: 16,
  },
  mascotaNombre: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#10b981',
  },
});
