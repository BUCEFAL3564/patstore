// Точка входа контейнера: применить миграции, наполнить пустую базу и запустить сервер.
// Миграции здесь, а не отдельным шагом: на бесплатном Render нет pre-deploy команды.
// Написано на JS, а не на sh, чтобы не зависеть от окончаний строк Windows (CRLF) в скриптах
const { execFileSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const run = (args) => execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' });

run([require.resolve('prisma/build/index.js'), 'migrate', 'deploy']);
run(['prisma/seed.js', '--if-empty']);

// Сервер запускается в этом же процессе: он остаётся главным (PID 1) и сам получает SIGTERM
require('./index');
