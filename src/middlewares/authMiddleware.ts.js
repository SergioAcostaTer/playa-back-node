const { jwtVerify } = require('../utils/jwt');
const User = require('../models/User');
const { clearToken } = require('../utils/cookies');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

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
    const decoded = jwtVerify(token);
    if (!decoded || !decoded.id) {
      logger.info('Invalid or missing token claims');
      
      // Clear the token in the response
      res.clearCookie('token');

      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({
          message: 'Invalid or missing token claims',
          status: StatusCodes.UNAUTHORIZED,
        })
        .end();
    }

    // Find user based on the decoded token
    const user = await User.findOne({ id: decoded.id }, { _id: 0, __v: 0 }).lean();

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
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: 'Internal server error',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      })
      .end();
  }
};

module.exports = authMiddleware;
