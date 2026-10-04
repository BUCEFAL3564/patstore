const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashPassword, verifyPassword };
