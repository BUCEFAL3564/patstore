const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/httpError');
const { hashPassword, verifyPassword } = require('../lib/password');
const { signToken } = require('../lib/jwt');

// Сравниваем с этим хешем, когда email не найден: время ответа одинаковое,
// и по нему нельзя узнать, зарегистрирован ли email
const dummyHashPromise = hashPassword('dummy-password-for-timing');

function toPublicUser(user) {
  return { id: user.id, email: user.email, role: user.role, created_at: user.created_at };
}

async function register(req, res) {
  const { email, password } = req.validated.body;
  const password_hash = await hashPassword(password);

  try {
    const user = await prisma.user.create({ data: { email, password_hash } });
    res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
  } catch (err) {
    // Уникальный индекс на email ловит и одновременные регистрации, в отличие от проверки заранее
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'Email is already registered');
    }
    throw err;
  }
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email } });

  const passwordOk = await verifyPassword(password, user ? user.password_hash : await dummyHashPromise);
  if (!user || !passwordOk) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
}

function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

module.exports = { register, login, me };
