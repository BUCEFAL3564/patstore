function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Не задана переменная окружения ${name} (см. .env.example)`);
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .map((origin) => (/^https?:\/\//.test(origin) ? origin : `https://${origin}`)),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  cache: {
    servers: process.env.MEMCACHED_SERVERS || '',
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 90,
  },
};
