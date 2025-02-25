const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');

/**
 * Login or Register user using Google Auth (email from Google)
 * @param {string} email - User's email from Google
 * @param {Object} res - Response object to set cookies
 * @returns {Promise<Object>} - The user and generated tokens
 */
const loginWithGoogle = async (email, res) => {
  let user = await userService.getUserByEmail(email);

  // If the user does not exist, register them
  if (!user) {
    user = await userService.createUser({ email });
  }

  // Generate tokens for the user
  const tokens = await tokenService.generateToken(user.email, tokenTypes.ACCESS);

  return { user, tokens };
};

/**
 * Logout user by removing the refresh token
 * @param {Object} res - Response object to clear cookies
 * @returns {Promise} - Resolves when user is logged out
 */
const logout = async (res) => {
  // Clear the cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return;
};

module.exports = {
  loginWithGoogle,
  logout,
};
