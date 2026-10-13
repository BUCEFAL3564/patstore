// Точка входа контейнера: применить миграции, наполнить пустую базу и запустить сервер.
// Миграции здесь, а не отдельным шагом: на бесплатном Render нет pre-deploy команды.
// Написано на JS, а не на sh, чтобы не зависеть от окончаний строк Windows (CRLF) в скриптах
const { execFileSync, spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const run = (args) => execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' });

// На хостинге без отдельного сервиса кэша (Render free) Memcached запускается в этом же контейнере.
// Если он упадёт, API продолжит работать напрямую с БД (см. src/lib/cache.js)
if (process.env.EMBEDDED_MEMCACHED === 'true') {
  const memcached = spawn('memcached', ['-m', '64', '-l', '127.0.0.1', '-p', '11211', '-U', '0'], { stdio: 'inherit' });
  memcached.on('error', (err) => console.warn(`Embedded memcached failed to start: ${err.message}`));
  memcached.on('exit', (code) => console.warn(`Embedded memcached exited with code ${code}`));
  process.on('exit', () => memcached.kill());
}

run([require.resolve('prisma/build/index.js'), 'migrate', 'deploy']);
run(['prisma/seed.js', '--if-empty']);

// Сервер запускается в этом же процессе: он остаётся главным (PID 1) и сам получает SIGTERM
require('./index');
