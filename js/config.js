// ========== API ADDRESS ==========
// Локально (localhost или файл) — API на этом же компьютере.
// На хостинге — адрес бэкенда на Render (заполняется при деплое).
const PRODUCTION_API_URL = '';

const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

window.KEYHUB_API_URL = isLocal || !PRODUCTION_API_URL ? 'http://localhost:3000/api' : PRODUCTION_API_URL;
