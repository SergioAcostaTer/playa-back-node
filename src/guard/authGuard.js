const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const authGuard = {
  isAuth: (req, res, next) => {
    const { user } = res.locals;

    if (user) {
      return next();
    }

    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: ReasonPhrases.UNAUTHORIZED,
      status: StatusCodes.UNAUTHORIZED,
    });
  },

  isGuest: (req, res, next) => {
    const { user } = res.locals;
    if (!user) {
      return next();
    }

    return res.status(StatusCodes.FORBIDDEN).json({
      message: ReasonPhrases.FORBIDDEN,
      status: StatusCodes.FORBIDDEN,
    });
  },
};

module.exports = authGuard;
