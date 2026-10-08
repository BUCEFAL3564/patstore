const crypto = require('crypto');
const cache = require('../lib/cache');
const config = require('../config');

// Memcached не умеет удалять ключи по префиксу, поэтому все страницы каталога лежат
// под общей версией: products:v<версия>:<хеш query>. Сброс кэша = увеличить версию:
// старые страницы больше никто не читает, и они сами истекают по TTL.
// Начальная версия случайная: если Memcached перезапустится или вытеснит ключ версии,
// новые ключи не совпадут со старыми. Меньше 2^32 — ограничение memjs.increment
const VERSION_KEY = 'products:version';
const randomInitialVersion = () => crypto.randomInt(1, 1_000_000_000);

// Ключ строится из query-строки (требование ТЗ). Берём проверенные параметры с подставленными
// значениями по умолчанию и сортируем их, чтобы ?page=1&limit=12, ?limit=12&page=1 и пустой
// запрос давали один ключ. Хеш нужен, потому что ключ Memcached — до 250 байт и без пробелов,
// а search может содержать что угодно
function canonicalQueryString(query) {
  const params = new URLSearchParams();
  for (const name of Object.keys(query).sort()) {
    if (query[name] !== undefined) params.append(name, String(query[name]));
  }
  return params.toString();
}

// Версия читается один раз на запрос, и страница записывается под тем же ключом.
// Если каталог успели изменить, пока шёл запрос в БД, устаревшая страница ляжет под старую
// версию, и её никто не прочитает
async function readCatalogPage(query) {
  const version = await cache.increment(VERSION_KEY, 0, randomInitialVersion());
  if (version === null) {
    return { key: null, body: null };
  }

  const hash = crypto.createHash('sha1').update(canonicalQueryString(query)).digest('hex');
  const key = `products:v${version}:${hash}`;
  return { key, body: await cache.get(key) };
}

async function writeCatalogPage(key, body) {
  if (key) await cache.set(key, body, config.cache.ttlSeconds);
}

// Вызывается после любого изменения каталога: создание, изменение, удаление товара
async function invalidateCatalog() {
  await cache.increment(VERSION_KEY, 1, randomInitialVersion());
}

module.exports = { readCatalogPage, writeCatalogPage, invalidateCatalog };
