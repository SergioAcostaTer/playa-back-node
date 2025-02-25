const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService } = require('../services');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginWithGoogle(email);

  res.cookie('accessToken', tokens.access.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Restrict cross-site requests
    maxAge: tokens.access.expires.getTime() - Date.now(),
  });

  res.status(httpStatus.OK).json(user);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  login,
  logout,
};
