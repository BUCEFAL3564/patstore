const memjs = require('memjs');
const config = require('../config');

// Кэш не должен ронять API: если Memcached недоступен, каждый метод возвращает «промах»,
// запрос идёт прямо в БД, а предупреждение пишется в лог один раз, пока связь не вернётся
const client = config.cache.servers
  ? memjs.Client.create(config.cache.servers, {
      retries: 0,
      timeout: 0.3,
      expires: 0,
      logger: { log() {} },
    })
  : null;

let available = true;

// memjs после обрыва соединения (например, Memcached перезапустили) может не завершить
// следующий запрос никогда — её собственный timeout в этом случае не срабатывает.
// Поэтому у каждой операции свой жёсткий таймаут
const OPERATION_TIMEOUT_MS = 500;

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      const err = new Error('operation timed out');
      err.code = 'ETIMEDOUT';
      reject(err);
    }, OPERATION_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Server#error уничтожает сокет и отклоняет повисшие запросы; при следующем обращении
// memjs подключится заново (обычный close() сокет не сбрасывает, и переподключения не будет)
function resetConnections() {
  for (const server of client.servers) {
    server.error(new Error('memcached operation timed out'));
  }
}

async function safely(operation, fallback) {
  if (!client) return fallback;
  try {
    const result = await withTimeout(operation(client));
    if (!available) {
      console.warn('Memcached снова доступен');
      available = true;
    }
    return result;
  } catch (err) {
    if (err.code === 'ETIMEDOUT') resetConnections();
    if (available) {
      console.warn(`Memcached недоступен (${err.code || err.message || err}), запросы идут без кэша`);
      available = false;
    }
    return fallback;
  }
}

const get = (key) =>
  safely(async (c) => {
    const { value } = await c.get(key);
    return value ? value.toString() : null;
  }, null);

const set = (key, value, ttlSeconds) => safely((c) => c.set(key, value, { expires: ttlSeconds }), false);

// initial — значение, если ключа ещё нет. memjs.increment ломается на числах >= 2^32
const increment = (key, amount, initial) =>
  safely(async (c) => (await c.increment(key, amount, { initial })).value, null);

function close() {
  if (client) client.close();
}

module.exports = { get, set, increment, close };
