const logger = require('../config/logger');
const { verifyToken } = require('../services/token.service');
const httpStatus = require('http-status/lib');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies['token'] ||
      (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ')
        ? req.headers['authorization'].split(' ')[1]
        : null);

    if (!token) {
      logger.info('No token found in cookies or Authorization header');
      return next();
    }

    // Verify the JWT token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      logger.info('Invalid or missing token claims');

      // Clear the token in the response
      res.clearCookie('token');

      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({
          message: 'Invalid or missing token claims',
          status: httpStatus.UNAUTHORIZED,
        })
        .end();
    }

    // Find user based on the decoded token
    const user = {
      email: decoded.id,
    };

    if (!user) {
      logger.info(`No user found for username: ${decoded.id}`);

      res.clearCookie('token');

      return next();
    }

    // Attach user info to the response locals for further processing
    res.locals.user = user;

    logger.info(`User ${user.email} authenticated successfully`);

    return next();
  } catch (error) {
    logger.error('Error in authentication middleware:', error);

    // Clear the token if there is an error
    res.clearCookie('token');

    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({
        message: 'Internal server error',
        status: httpStatus.INTERNAL_SERVER_ERROR,
      })
      .end();
  }
};

module.exports = authMiddleware;
