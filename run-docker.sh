#!/bin/bash

# Script para iniciar rápidamente el proyecto con Docker Compose

echo "🚀 Iniciando SerPlantas Backend con Docker Compose..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Mostrar opciones
echo "Elige una opción:"
echo ""
echo "1) Iniciar servicios (up -d)"
echo "2) Ver logs (logs -f)"
echo "3) Detener servicios (down)"
echo "4) Reiniciar servicios (restart)"
echo "5) Ver estado (ps)"
echo "6) Reconstruir imágenes (build)"
echo ""
read -p "Opción (1-6): " option

case $option in
    1)
        echo "📦 Iniciando servicios..."
        docker-compose up -d
        echo ""
        echo "✅ Servicios iniciados"
        echo "🌐 Backend disponible en: http://localhost:3000"
        echo "🗄️  PostgreSQL disponible en: localhost:5432"
        ;;
    2)
        echo "📋 Mostrando logs..."
        docker-compose logs -f
        ;;
    3)
        echo "🛑 Deteniendo servicios..."
        docker-compose down
        echo "✅ Servicios detenidos"
        ;;
    4)
        echo "🔄 Reiniciando servicios..."
        docker-compose restart
        echo "✅ Servicios reiniciados"
        ;;
    5)
        echo "📊 Estado de servicios:"
        docker-compose ps
        ;;
    6)
        echo "🔨 Reconstruyendo imágenes..."
        docker-compose build --no-cache
        echo "✅ Imágenes reconstruidas"
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac
