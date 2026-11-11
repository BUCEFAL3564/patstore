const crypto = require('crypto');
const cache = require('../lib/cache');
const config = require('../config');

const VERSION_KEY = 'products:version';
const randomInitialVersion = () => crypto.randomInt(1, 1_000_000_000);

function canonicalQueryString(query) {
  const params = new URLSearchParams();
  for (const name of Object.keys(query).sort()) {
    if (query[name] !== undefined) params.append(name, String(query[name]));
  }
  return params.toString();
}

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

async function invalidateCatalog() {
  await cache.increment(VERSION_KEY, 1, randomInitialVersion());
}

module.exports = { readCatalogPage, writeCatalogPage, invalidateCatalog };
