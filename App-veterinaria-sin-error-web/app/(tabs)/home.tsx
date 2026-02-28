import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const { user } = useAuth();

  const quickActions = [
    { 
      id: 1, 
      title: 'Mis Citas', 
      icon: 'calendar',
      colors: ['#7c3aed', '#a78bfa'],
      action: () => onNavigate('citas')
    },
    { 
      id: 2, 
      title: 'Mis Mascotas', 
      icon: 'paw',
      colors: ['#38bdf8', '#0ea5e9'],
      action: () => onNavigate('mascotas')
    },
    { 
      id: 3, 
      title: 'Tratamientos', 
      icon: 'medical',
      colors: ['#f59e0b', '#f97316'],
      action: () => onNavigate('tratamientos')
    },
    { 
      id: 4, 
      title: 'Historial', 
      icon: 'document-text',
      colors: ['#10b981', '#059669'],
      action: () => onNavigate('historial')
    },
  ];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={action.action}
              style={styles.actionCardWrapper}
            >
              <LinearGradient
                colors={action.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCard}
              >
                <Ionicons name={action.icon as any} size={36} color="#fff" />
                <Text style={styles.actionText}>{action.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Información del Usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mi Información</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#7c3aed" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
          
          {user?.telefono && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#38bdf8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user.telefono}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Tipo de Usuario</Text>
              <Text style={styles.infoValue}>
                {user?.rol === 'admin' ? 'Administrador' : 'Cliente'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Consejos */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#7c3aed', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tipsCard}
        >
          <Text style={styles.tipsTitle}>💡 Consejos Útiles</Text>
          <Text style={styles.tipsText}>
            • Agenda citas regulares para el bienestar de tus mascotas{'\n'}
            • Mantén tu información de contacto actualizada{'\n'}
            • Revisa los tratamientos activos de tus mascotas
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  actionCardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#f3e8ff',
  },
});
