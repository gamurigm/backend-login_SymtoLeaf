# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejar señales
RUN apk add --no-cache dumb-init

# Copiar package.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar la aplicación compilada desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

USER nodejs

# Exponer puerto
EXPOSE 5050

# Usar dumb-init para ejecutar la aplicación
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
