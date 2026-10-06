const { PrismaClient } = require('@prisma/client');

// PRISMA_LOG=query печатает каждый SQL-запрос: так видно, что фильтры и сортировка выполняются в БД
const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG ? process.env.PRISMA_LOG.split(',').map((level) => level.trim()) : [],
});

module.exports = prisma;
