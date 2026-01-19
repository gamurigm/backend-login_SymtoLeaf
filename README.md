# 🌱 SerPlantas Backend - Secure Authentication System

Backend seguro en **NestJS** con autenticación JWT, doble factor (2FA) con Google Authenticator y PostgreSQL en Docker.

---

## 🚀 Inicio Rápido (5 minutos)

```bash
# 1. Navega a la carpeta
cd backend-auth

# 2. Inicia los servicios
docker-compose up -d

# 3. Abre Swagger en tu navegador
# http://localhost:3000/api/docs
```

**¡Listo!** Tu backend está corriendo. Ver [QUICK_START.md](./QUICK_START.md) para guía completa.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|------------|
| [QUICK_START.md](./QUICK_START.md) | ⭐ **EMPIEZA AQUÍ** - Guía paso a paso (5 min) |
| [BACKEND_README.md](./BACKEND_README.md) | Documentación técnica completa |
| [USAGE_GUIDE.md](./USAGE_GUIDE.md) | Cómo usar cada endpoint |
| [SWAGGER/API DOCS](http://localhost:3000/api/docs) | 📖 Documentación interactiva (cuando corra) |
| [FAQ.md](./FAQ.md) | Preguntas frecuentes |
| [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) | Ejemplos de código |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deployment a producción |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Estructura del código |

---

## ✨ Características

- ✅ **JWT Authentication** - Tokens con 10 minutos de expiración
- ✅ **2FA (Google Authenticator)** - TOTP + Códigos de respaldo
- ✅ **Bcrypt Passwords** - Encriptación segura
- ✅ **PostgreSQL** - En Docker Compose
- ✅ **Swagger Docs** - Documentación interactiva en `/api/docs`
- ✅ **Validación Stricta** - DTOs con class-validator
- ✅ **TypeScript** - Código type-safe
- ✅ **Guards** - Protección de rutas
- ✅ **CORS** - Habilitado para desarrollo
- ✅ **Docker** - Containerizado y listo para producción

---

## 🛠️ Requisitos

- **Docker** y **Docker Compose**
- **Node.js 18+** (opcional, solo si ejecutas sin Docker)

Verificar instalación:
```bash
docker --version
docker-compose --version
```

---

## 🔄 Comandos Principales

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Sin Docker (desarrollo local)
npm install
npm run start:dev
```

---

## 📊 Endpoints Disponibles (en Swagger)

### Autenticación
- `POST /auth/register` - Crear usuario
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil (protegido)
- `POST /auth/logout` - Logout

### 2FA
- `GET /auth/2fa/setup` - QR para Authenticator
- `POST /auth/2fa/enable` - Habilitar 2FA
- `POST /auth/login-2fa` - Login con código 2FA

---

## 📞 URLs Importantes

| Recurso | URL |
|---------|-----|
| **API Base** | http://localhost:3000 |
| **Swagger UI** | http://localhost:3000/api/docs |
| **Swagger JSON** | http://localhost:3000/api-json |

---

## 🎯 Próximos Pasos

1. **Lee [QUICK_START.md](./QUICK_START.md)** - Guía paso a paso
2. **Abre** http://localhost:3000/api/docs - Swagger interactivo
3. **Registra un usuario** - POST `/auth/register`
4. **Haz login** - POST `/auth/login`
5. **Explora endpoints** - Usa Swagger para probar

---

## 🐛 Problemas

Si encuentras problemas, consulta:
- [QUICK_START.md - Solución de Problemas](./QUICK_START.md#solución-de-problemas)
- [FAQ.md](./FAQ.md)

---

## 📄 Licencia

MIT

---

**Empieza ahora:** [Lee la guía rápida →](./QUICK_START.md)
