const express = require('express');
const cors = require('cors');
const config = require('./config');
const prisma = require('./lib/prisma');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors({ origin: config.corsOrigins.length ? config.corsOrigins : true }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', db: 'unavailable' });
  }
});

app.use('/api/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express 5 сам передаёт сюда ошибки из async-обработчиков.
// 4xx (наши HttpError и ошибки express.json, например битый JSON) уходят клиенту как есть,
// 5xx логируются, а клиент видит только общее сообщение
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);

  const body = { error: err.expose ? err.message : 'Internal server error' };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
});

module.exports = app;
