const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');

/**
 * Generate a JWT token
 * @param {string} email
 * @param {string} secret
 * @param {Moment} expires - The expiration time for the token
 * @returns {string} - The generated token
 */
const generateToken = (email, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: email,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret);
};

/**
 * Verify the JWT token
 * @param {string} token - The JWT token to be verified
 * @returns {Object} - The decoded payload of the token
 * @throws {ApiError} - If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };
