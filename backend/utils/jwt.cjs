// backend/utils/jwt.cjs
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function generateToken(payload, expiresIn = '2h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { generateToken };