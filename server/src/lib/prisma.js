const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG ? process.env.PRISMA_LOG.split(',').map((level) => level.trim()) : [],
});

module.exports = prisma;
