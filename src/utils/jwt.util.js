const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'evvo-erp',
    audience: 'evvo-erp-client',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'evvo-erp',
    audience: 'evvo-erp-client',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret, {
    issuer: 'evvo-erp',
    audience: 'evvo-erp-client',
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'evvo-erp',
    audience: 'evvo-erp-client',
  });
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const generateTokenPair = (payload) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: payload.id });
  return { accessToken, refreshToken };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  generateTokenPair,
};
