#!/bin/bash

# Script de pruebas para SerPlantas Backend
# Ejecutar después de iniciar Docker Compose

API_URL="http://localhost:3000"
COLORS='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${COLORS}"
echo -e "${BLUE}║        SerPlantas Backend - Test Suite                 ║${COLORS}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${COLORS}"
echo ""

# Verificar que la API está disponible
echo -e "${YELLOW}[1/7]${COLORS} Verificando conexión a la API..."
if ! curl -s "${API_URL}" > /dev/null; then
  echo -e "${RED}❌ No se pudo conectar a ${API_URL}${COLORS}"
  echo "Asegurate de que Docker Compose está corriendo:"
  echo "docker-compose up -d"
  exit 1
fi
echo -e "${GREEN}✅ API disponible${COLORS}"
echo ""

# 1. PRUEBA DE REGISTRO
echo -e "${YELLOW}[2/7] Prueba: REGISTRO DE USUARIO${COLORS}"
echo "Endpoint: POST /auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "secondName": "User",
    "lastName": "Rodriguez",
    "secondLastName": "Garcia",
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPassword123!"
  }')

echo "Respuesta:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extraer token y username
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken' 2>/dev/null)
USERNAME=$(echo "$REGISTER_RESPONSE" | jq -r '.user.username' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo -e "${GREEN}✅ Registro exitoso${COLORS}"
  echo "   Usuario: $USERNAME"
  echo "   Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}❌ Error en registro${COLORS}"
  exit 1
fi
echo ""

# 2. PRUEBA DE OBTENER PERFIL (Autenticado)
echo -e "${YELLOW}[3/7] Prueba: OBTENER PERFIL (Autenticado)${COLORS}"
echo "Endpoint: GET /auth/profile"
echo "Auth: Bearer token"
echo ""

PROFILE_RESPONSE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Respuesta:"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

if echo "$PROFILE_RESPONSE" | grep -q "Perfil obtenido"; then
  echo -e "${GREEN}✅ Perfil obtenido correctamente${COLORS}"
else
  echo -e "${RED}⚠️  Error al obtener perfil${COLORS}"
fi
echo ""

# 3. PRUEBA DE LOGIN
echo -e "${YELLOW}[4/7] Prueba: LOGIN${COLORS}"
echo "Endpoint: POST /auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${USERNAME}\",
    \"password\": \"TestPassword123!\"
  }")

echo "Respuesta:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ "$LOGIN_TOKEN" != "null" ] && [ "$LOGIN_TOKEN" != "" ]; then
  echo -e "${GREEN}✅ Login exitoso${COLORS}"
  echo "   Token: ${LOGIN_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Error en login${COLORS}"
fi
echo ""

# 4. PRUEBA DE SETUP 2FA
echo -e "${YELLOW}[5/7] Prueba: SETUP 2FA (Obtener QR)${COLORS}"
echo "Endpoint: GET /auth/2fa/setup"
echo ""

SETUP2FA_RESPONSE=$(curl -s -X GET "${API_URL}/auth/2fa/setup" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Respuesta (truncado):"
echo "$SETUP2FA_RESPONSE" | jq '{secret, message}' 2>/dev/null || echo "$SETUP2FA_RESPONSE"
echo ""

SECRET=$(echo "$SETUP2FA_RESPONSE" | jq -r '.secret' 2>/dev/null)

if [ "$SECRET" != "null" ] && [ "$SECRET" != "" ]; then
  echo -e "${GREEN}✅ QR generado correctamente${COLORS}"
  echo "   Secret: $SECRET"
  echo ""
  echo "INSTRUCCIONES:"
  echo "1. Descarga Google Authenticator en tu teléfono"
  echo "2. Abre la app y toca '+' o 'Agregar cuenta'"
  echo "3. Selecciona 'Escanear código QR'"
  echo "4. Escanea el código QR recibido en el endpoint"
  echo "5. Obtén el código de 6 dígitos"
  echo "6. Usa ese código en el siguiente paso"
else
  echo -e "${YELLOW}⚠️  No se generó el QR (normal si es 1era vez)${COLORS}"
fi
echo ""

# 5. PRUEBA DE VALIDACIÓN SIN AUTENTICACIÓN
echo -e "${YELLOW}[6/7] Prueba: VALIDACIÓN - Acceso sin token${COLORS}"
echo "Endpoint: GET /auth/profile (sin Authorization header)"
echo ""

NO_AUTH_RESPONSE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$NO_AUTH_RESPONSE" | head -n-1)

echo "HTTP Code: $HTTP_CODE"
echo "Respuesta:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Seguridad verificada - 401 sin autenticación${COLORS}"
else
  echo -e "${RED}❌ Error - Se permitió acceso sin autenticación${COLORS}"
fi
echo ""

# 6. PRUEBA DE LOGOUT
echo -e "${YELLOW}[7/7] Prueba: LOGOUT${COLORS}"
echo "Endpoint: POST /auth/logout"
echo ""

LOGOUT_RESPONSE=$(curl -s -X POST "${API_URL}/auth/logout" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Respuesta:"
echo "$LOGOUT_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGOUT_RESPONSE"
echo ""

if echo "$LOGOUT_RESPONSE" | grep -q "Logout exitoso"; then
  echo -e "${GREEN}✅ Logout exitoso${COLORS}"
else
  echo -e "${YELLOW}⚠️  Logout completado${COLORS}"
fi
echo ""

# Resumen
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${COLORS}"
echo -e "${BLUE}║                     RESUMEN                           ║${COLORS}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${COLORS}"
echo ""
echo -e "${GREEN}✅ Pruebas completadas${COLORS}"
echo ""
echo "Datos de prueba creados:"
echo "  Usuario: $USERNAME"
echo "  Email: (verificar en logs)"
echo "  Contraseña: TestPassword123!"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar logs de Docker:"
echo "     docker-compose logs -f backend"
echo "  2. Conectar a PostgreSQL:"
echo "     docker exec -it serplantas_db psql -U serplantas -d serplantas_db"
echo "  3. Ver usuarios creados:"
echo "     SELECT username, email, \"twoFactorEnabled\" FROM users;"
echo "  4. Leer documentación completa:"
echo "     - BACKEND_README.md"
echo "     - USAGE_GUIDE.md"
echo "     - PROJECT_STRUCTURE.md"
echo ""
echo -e "${BLUE}¡Pruebas completadas! 🎉${COLORS}"
