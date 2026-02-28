import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [buttonScale] = useState(new Animated.Value(1));
  const [colorAnim] = useState(new Animated.Value(0));
  const [fieldsAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const getApiUrl = () => {
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
    return envApiUrl || 'https://veterinaria-backend-virid.vercel.app';
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 'none', color: '#6366f1', width: '0%', text: '' };
    if (pass.length < 6) return { strength: 'weak', color: '#dc2626', width: '33%', text: 'Débil' };
    
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    
    if (strength <= 1) return { strength: 'weak', color: '#dc2626', width: '33%', text: 'Débil' };
    if (strength === 2) return { strength: 'medium', color: '#f59e0b', width: '66%', text: 'Media' };
    return { strength: 'strong', color: '#10b981', width: '100%', text: 'Fuerte' };
  };

  const passwordStrength = getPasswordStrength(password);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const callEmergency = () => {
    Linking.openURL('tel:555555555');
  };

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

  useEffect(() => {
    Animated.timing(fieldsAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

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

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      setMessage('Por favor completa todos los campos');
      setMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('El correo no tiene un formato válido');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setMessageType('error');
      return;
    }

    if (phone.length < 8) {
      setMessage('El teléfono debe tener al menos 8 dígitos');
      setMessageType('error');
      return;
    }

    animateButton();
    const userData = {
      nombre: name,
      email,
      password,
      telefono: phone,
      direccion: '',
    };

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setMessage('Respuesta inválida del servidor');
        setMessageType('error');
        return;
      }

      if (response.ok && data.success) {
        setMessage('¡Registro exitoso!');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
          router.push('/login');
        }, 1500);
      } else {
        setMessage((data && data.message) ? data.message : 'Error al registrar');
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage('Error de conexión: ' + (error?.message || error));
      setMessageType('error');
    }
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#232526' }}>
      <LinearGradient
        colors={['#232526cc', '#7c3aedcc', '#232526cc']}
        style={styles.container}
      >
        <Ionicons name="paw" size={80} color="rgba(255, 255, 255, 0.08)" style={styles.decorativePaw1} />
        <Ionicons name="paw" size={60} color="rgba(255, 255, 255, 0.06)" style={styles.decorativePaw2} />
        
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
                  },
                ]}
              >
                VetNova
              </Animated.Text>
              <Text style={styles.subtitle}>Crea tu cuenta para acceder</Text>
            </View>

            <Animated.View style={{
              opacity: fieldsAnim,
              transform: [{ translateY: fieldsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
              width: '100%',
            }}>
              <View style={styles.form}>
                <View style={[styles.inputContainer, name ? styles.inputActive : null]}>
                  <Ionicons name="person" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={[styles.inputContainer, email ? styles.inputActive : null]}>
                  <Ionicons name="mail" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={(text) => setEmail(text.toLowerCase())}
                    keyboardType="email-address"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={[styles.inputContainer, phone ? styles.inputActive : null]}>
                  <Ionicons name="call" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={[styles.inputContainer, password ? styles.inputActive : null]}>
                  <Ionicons name="lock-closed" size={20} color="#a1a1aa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={(text) => setPassword(text.trim())}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#a1a1aa" />
                  </TouchableOpacity>
                </View>

                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      {/* AQUÍ ESTÁ EL FIX DEL WIDTH */}
                      <View style={[styles.passwordStrengthFill, { width: passwordStrength.width as any, backgroundColor: passwordStrength.color }]} />
                    </View>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <LinearGradient
                      colors={['#7c3aed', '#38bdf8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Registrarse</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <View style={{ width: '100%', alignItems: 'center', marginTop: 15 }}>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={{ color: '#a1a1aa', fontSize: 16 }}>
                      ¿Ya tienes cuenta? <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>Inicia sesión</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { width: '100%', alignItems: 'center' },
  cardWithTitle: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    overflow: 'hidden'
  },
  headerAppInsideCard: { alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginTop: 5 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#27272a'
  },
  inputActive: { borderColor: '#7c3aed' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#fff' },
  eyeIcon: { padding: 5 },
  passwordStrengthContainer: { marginBottom: 15 },
  passwordStrengthBar: { height: 4, backgroundColor: '#3f3f46', borderRadius: 2, overflow: 'hidden' },
  passwordStrengthFill: { height: '100%' }, // SE ELIMINÓ TRANSITION
  passwordStrengthText: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  button: { borderRadius: 10, overflow: 'hidden', marginTop: 10 },
  buttonGradient: { paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messageContainer: { marginTop: 15, padding: 10, borderRadius: 8 },
  successMessage: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: '#10b981' },
  errorMessage: { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderWidth: 1, borderColor: '#dc2626' },
  messageText: { textAlign: 'center' },
  successText: { color: '#10b981' },
  errorText: { color: '#dc2626' },
  backgroundPaw: { position: 'absolute', opacity: 0.1, bottom: -20, right: -20 },
  decorativePaw1: { position: 'absolute', top: 50, left: 20 },
  decorativePaw2: { position: 'absolute', top: 150, right: 30 },
});