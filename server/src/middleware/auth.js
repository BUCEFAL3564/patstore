const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/httpError');
const { verifyToken } = require('../lib/jwt');

async function authenticate(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') || '');
  if (!match) {
    throw new HttpError(401, 'Authorization token is required');
  }

  let payload;
  try {
    payload = verifyToken(match[1]);
  } catch (err) {
    throw new HttpError(401, err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
  }

  const id = Number(payload.sub);
  const user = Number.isInteger(id)
    ? await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true, created_at: true },
      })
    : null;
  if (!user) {
    throw new HttpError(401, 'Invalid token');
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authorization token is required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Forbidden: insufficient role'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
