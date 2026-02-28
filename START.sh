#!/bin/bash

# 🏥 SISTEMA INTEGRAL DE VETERINARIA
# Instrucciones rápidas para ejecutar todo

echo "=========================================="
echo "🏥 Sistema de Veterinaria"
echo "=========================================="
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Sistema Windows detectado"
    echo ""
    echo "Abre TRES terminales y ejecuta esto en cada una:"
    echo ""
    echo "--- Terminal 1 (Backend) ---"
    echo "cd veterinaria-backend"
    echo "npm start"
    echo ""
    echo "--- Terminal 2 (Admin Panel) ---"
    echo "cd veterinaria-admin"
    echo "npm run dev"
    echo ""
    echo "--- Terminal 3 (App Móvil) ---"
    echo "cd App-veterinaria-sin-error-web"
    echo "npm start"
    echo ""
else
    echo "Sistema Unix/Linux/Mac detectado"
    echo ""
    echo "Ejecutando todas las instancias..."
    echo ""
    
    # Backend
    (cd veterinaria-backend && npm start) &
    BACKEND_PID=$!
    sleep 2
    
    # Admin Panel
    (cd veterinaria-admin && npm run dev) &
    ADMIN_PID=$!
    sleep 2
    
    # App Móvil
    (cd App-veterinaria-sin-error-web && npm start) &
    APP_PID=$!
    
    echo ""
    echo "✅ Todos los servicios iniciados"
    echo ""
    echo "Backend:  http://localhost:3001"
    echo "Admin:    http://localhost:5173"
    echo "App:      http://localhost:8081"
    echo ""
    echo "Presiona Ctrl+C para detener"
    
    wait
fi

echo ""
echo "=========================================="
echo "📋 CREDENCIALES DE PRUEBA"
echo "=========================================="
echo ""
echo "Admin Panel:"
echo "  Email: admin@veterinaria.com"
echo "  Password: password123"
echo ""
echo "Cliente de Prueba (solo backend):"
echo "  Email: cliente@ejemplo.com"
echo "  Password: cliente123"
echo ""
echo "=========================================="
