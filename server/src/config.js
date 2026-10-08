function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Не задана переменная окружения ${name} (см. .env.example)`);
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  cache: {
    // Пусто = кэш выключен, API работает напрямую с БД
    servers: process.env.MEMCACHED_SERVERS || '',
    // ТЗ: TTL 60–120 секунд
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 90,
  },
};
