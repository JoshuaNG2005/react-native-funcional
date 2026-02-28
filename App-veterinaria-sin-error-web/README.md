# App Veterinaria Móvil - Login con Expo y API Node.js

Esta es una aplicación móvil desarrollada con React Native y Expo para el sistema veterinario. Permite iniciar sesión conectándose a la API backend del curso anterior (Node.js + Express + MySQL), que debe estar ejecutándose en `http://localhost:3001`. La app extiende la funcionalidad del sistema web existente, permitiendo acceso móvil para administradores.

## Características
- Inicio de sesión seguro con validación de credenciales.
- Conexión a API RESTful para autenticación.
- Persistencia de sesión con AsyncStorage.
- Interfaz de usuario con gradientes, animaciones y mensajes de feedback.
- Navegación con Expo Router.
- Diseño responsivo para móviles.

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalados los siguientes componentes:
- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (instálalo globalmente con `npm install -g @expo/cli`)
- Un dispositivo móvil o emulador con la app [Expo Go](https://expo.dev/go) instalada
- La API backend del curso anterior ejecutándose en `localhost:3001` (consulta el proyecto anterior para su configuración)

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar la App
```bash
npx expo start
```
Escanea el código QR con la app Expo Go en tu dispositivo móvil, o selecciona una opción para emulador.

## Uso de la Aplicación
1. Asegúrate de que la API backend esté ejecutándose en `localhost:3001`.
2. Al abrir la app, verás la pantalla de login.
3. Ingresa tus credenciales (usuario y contraseña) que estén registradas en la base de datos de la API.
4. Si las credenciales son correctas, serás redirigido a la pantalla principal (tabs).
5. La sesión se mantendrá hasta que cierres la app o hagas logout.

## Estructura del Proyecto
- `app/`: Páginas y layouts (usando Expo Router).
  - `login.tsx`: Pantalla de inicio de sesión.
  - `(tabs)/`: Navegación por pestañas.
  - `_layout.tsx`: Layout principal con guards de autenticación.
- `components/`: Componentes reutilizables (UI, icons, etc.).
- `contexts/`: Contextos de React (AuthContext para manejo de sesión).
- `hooks/`: Hooks personalizados.
- `constants/`: Constantes como temas.
- `assets/`: Imágenes y recursos.

## Tecnologías Utilizadas
- **Frontend Móvil**: React Native, Expo, Expo Router, AsyncStorage, React Native Reanimated, LinearGradient.
- **Backend**: API externa del curso anterior (Node.js, Express.js, MySQL, JWT, bcrypt).

## Solución de Problemas
- **Error de conexión a la API**: Asegúrate de que la API esté ejecutándose en `localhost:3001` y que tu dispositivo móvil esté en la misma red (o usa un emulador).
- **Problemas con la app**: Verifica que todas las dependencias estén instaladas y que uses una versión compatible de Expo.
- **Errores en animaciones**: Si ves warnings de Reanimated, actualiza las dependencias.

## Contribución
Si deseas contribuir:
1. Haz un fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia
Este proyecto es para fines educativos y no tiene licencia específica.

## Contacto
Para preguntas o soporte, contacta al desarrollador.
