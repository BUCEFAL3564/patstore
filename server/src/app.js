const express = require('express');
const cors = require('cors');
const config = require('./config');
const prisma = require('./lib/prisma');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    // Без этого браузерный JS не видит эти заголовки ответа
    exposedHeaders: ['X-Cache', 'Location'],
  })
);
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
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
