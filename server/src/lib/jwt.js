const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(user) {
  return jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.expiresIn,
  });
}

// Бросает TokenExpiredError / JsonWebTokenError, если токен просрочен или подделан.
// Алгоритм зафиксирован, чтобы нельзя было подсунуть токен с alg: none
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };
