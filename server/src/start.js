const { execFileSync, spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const run = (args) => execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' });

if (process.env.EMBEDDED_MEMCACHED === 'true') {
  const memcached = spawn('memcached', ['-m', '64', '-l', '127.0.0.1', '-p', '11211', '-U', '0'], { stdio: 'inherit' });
  memcached.on('error', (err) => console.warn(`Embedded memcached failed to start: ${err.message}`));
  memcached.on('exit', (code) => console.warn(`Embedded memcached exited with code ${code}`));
  process.on('exit', () => memcached.kill());
}

run([require.resolve('prisma/build/index.js'), 'migrate', 'deploy']);
run(['prisma/seed.js', '--if-empty']);

require('./index');
