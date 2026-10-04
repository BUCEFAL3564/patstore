require('dotenv').config({ quiet: true });

const config = require('./config');
const app = require('./app');
const prisma = require('./lib/prisma');

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
