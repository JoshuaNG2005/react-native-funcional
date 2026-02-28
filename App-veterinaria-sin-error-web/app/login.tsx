import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [buttonScale] = useState(new Animated.Value(1));
  const [bgAnim] = useState(new Animated.Value(0));
  const [colorAnim] = useState(new Animated.Value(0));
  const [fieldsAnim] = useState(new Animated.Value(0));
  // Animación de fondo degradado
  useEffect(() => {
    Animated.loop(
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [bgAnim]);
  // Animación de color sincronizada
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [colorAnim]);
  // Animación de entrada de campos
  useEffect(() => {
    Animated.timing(fieldsAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);
  const { login } = useAuth();

  // Navegación a registro
  const goToRegister = () => {
    router.push('/register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const callEmergency = () => {
    Linking.openURL('tel:555555555');
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Por favor ingresa email y contraseña');
      setMessageType('error');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('El correo no tiene un formato válido');
      setMessageType('error');
      return;
    }

    // Validación de contraseña
    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setMessageType('error');
      return;
    }

    animateButton();
    const result = await login(email, password);
    console.log('\n=== Login Debug ===');
    console.log('Login result:', result);
    console.log('User rol:', result.user?.rol);
    console.log('===================\n');
    
    if (result.success && result.user) {
      setMessage('¡Inicio de sesión exitoso!');
      setMessageType('success');
      
      setTimeout(() => {
        // Si es administrador, ir al panel admin integrado
        if (result.user?.rol === 'admin') {
          console.log('➡️ Navigating to /admin (admin user)');
          router.replace('/admin');
        } else {
          console.log('➡️ Navigating to / (client user)');
          // Si es cliente, ir a la app normal
          router.replace('/');
        }
      }, 800);
    } else {
      setMessage('❌ Credenciales incorrectas');
      setMessageType('error');
    }

    // Limpiar mensaje después de 3.5s
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3500);
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#232526',
      }}
    >
      <Animated.View
        style={[
          animatedBg,
          {
            opacity: bgAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
            backgroundColor: bgAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ['#232526', '#7c3aed', '#232526'],
            }),
          },
        ]}
      />
      <LinearGradient
        colors={['#232526cc', '#7c3aedcc', '#232526cc']}
        style={styles.container}
      >
        {/* Huellitas decorativas en el fondo */}
        <Ionicons name="paw" size={80} color="rgba(255, 255, 255, 0.08)" style={styles.decorativePaw1} />
        <Ionicons name="paw" size={60} color="rgba(255, 255, 255, 0.06)" style={styles.decorativePaw2} />
        <Ionicons name="paw" size={100} color="rgba(255, 255, 255, 0.05)" style={styles.decorativePaw3} />
        <Ionicons name="paw" size={70} color="rgba(255, 255, 255, 0.07)" style={styles.decorativePaw4} />
        <Ionicons name="paw" size={50} color="rgba(255, 255, 255, 0.06)" style={styles.decorativePaw5} />
        <Ionicons name="paw" size={90} color="rgba(255, 255, 255, 0.05)" style={styles.decorativePaw6} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.cardWithTitle}>
            <Ionicons name="paw" size={180} color="rgba(124, 58, 237, 0.15)" style={styles.backgroundPaw} />
            <View style={styles.headerAppInsideCard}>
              <Animated.Text
                style={[
                  styles.appName,
                  {
                    color: '#fff',
                    transform: [
                      {
                        scale: colorAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.08, 1],
                        }),
                      },
                    ],
                    textShadowColor: '#232526',
                    textShadowRadius: 18,
                  },
                ]}
              >
                VetNova
              </Animated.Text>
              <Text style={styles.subtitle}>Bienvenido a tu veterinaria digital</Text>
            </View>
            <Animated.View style={{
              opacity: fieldsAnim,
              transform: [{ translateY: fieldsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
              width: '100%',
            }}>
              <View style={styles.form}>
                <View style={[styles.inputContainer, email ? styles.inputActive : null]}>
                  <Ionicons name="mail" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={(text: string) => setEmail(text.toLowerCase())}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={[styles.inputContainer, password ? styles.inputActive : null]}>
                  <Ionicons name="lock-closed" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={(text: string) => setPassword(text.trim())}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#a1a1aa"
                    />
                  </TouchableOpacity>
                </View>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <LinearGradient
                      colors={['#7c3aed', '#38bdf8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                {/* Enlace dentro del recuadro negro, debajo del botón */}
                <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
                  <TouchableOpacity onPress={goToRegister} style={{ backgroundColor: '#18181b', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 }}>
                    <Text style={{ color: '#a1a1aa', fontSize: 16, textAlign: 'center' }}>
                      ¿No tienes cuenta? <Text style={{ color: '#38bdf8', fontWeight: 'bold', textDecorationLine: 'underline' }}>Regístrate</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Número de emergencia */}
                <TouchableOpacity style={styles.emergencyContainer} onPress={callEmergency}>
                  <Ionicons name="call" size={18} color="#ef4444" />
                  <Text style={styles.emergencyText}>
                    Emergencia: <Text style={styles.emergencyNumber}>555-555-555</Text>
                  </Text>
                </TouchableOpacity>
                {/* Mensaje de error o éxito */}
                {message ? (
                  <View style={[styles.messageContainer, messageType === 'success' ? styles.successMessage : styles.errorMessage]}>
                    <Text style={[styles.messageText, messageType === 'success' ? styles.successText : styles.errorText]}>{message}</Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Animated.View>
  );
}

// Definir el fondo animado fuera del StyleSheet
const animatedBg = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
};

const styles = StyleSheet.create({
  // El headerApp original ya no se usa fuera del card
  headerAppInsideCard: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 24,
  },
  backgroundPaw: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.6,
    transform: [{ rotate: '-15deg' }],
  },
  decorativePaw1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    transform: [{ rotate: '25deg' }],
  },
  decorativePaw2: {
    position: 'absolute',
    top: '25%',
    right: '15%',
    transform: [{ rotate: '-35deg' }],
  },
  decorativePaw3: {
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    transform: [{ rotate: '45deg' }],
  },
  decorativePaw4: {
    position: 'absolute',
    bottom: '30%',
    right: '12%',
    transform: [{ rotate: '-20deg' }],
  },
  decorativePaw5: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    transform: [{ rotate: '60deg' }],
  },
  decorativePaw6: {
    position: 'absolute',
    top: '60%',
    right: '8%',
    transform: [{ rotate: '-50deg' }],
  },
  cardWithTitle: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    width: '95%',
    maxWidth: 420,
    marginTop: 0,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    width: '90%',
    maxWidth: 400,
    marginTop: 0,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#232526',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold', // Si está disponible
  },
  hospitalIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fafafa',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#232526',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputActive: {
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.25,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: -8,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#a1a1aa',
    fontSize: 15,
  },
  registerTextBold: {
    color: '#38bdf8',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fafafa',
    letterSpacing: 0.5,
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: '#232526',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonGradient: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
  },
  messageContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  successMessage: {
    backgroundColor: '#232526',
    borderColor: '#06b6d4',
    borderWidth: 1.5,
  },
  errorMessage: {
    backgroundColor: '#232526',
    borderColor: '#dc2626',
    borderWidth: 1.5,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    color: '#fafafa',
  },
  errorText: {
    color: '#dc2626',
  },
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    marginTop: 12,
  },
  emergencyText: {
    color: '#fafafa',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  emergencyNumber: {
    fontWeight: 'bold',
    color: '#ef4444',
    fontSize: 16,
  },
});