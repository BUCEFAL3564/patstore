# Multi-stage build: зависимости → сборка → минимальный runtime-образ

# ---------- 1. deps: только production-зависимости (без nodemon и прочих dev-пакетов)
FROM node:24-alpine AS deps
# openssl нужен Prisma: по нему она выбирает, какой движок скачать при установке
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- 2. build: генерация Prisma Client под Linux (musl) по schema.prisma
FROM deps AS build
COPY prisma ./prisma
RUN npx prisma generate

# ---------- 3. runtime: только то, что нужно для запуска
FROM node:24-alpine AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app

# Файлы принадлежат root, а процесс работает от node — приложение не может изменить свой код
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src

# Непривилегированный пользователь из официального образа Node (требование ТЗ)
USER node

EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

# Миграции → наполнение пустой БД → сервер (см. src/start.js)
CMD ["node", "src/start.js"]
