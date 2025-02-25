const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const authMiddleware = require('./middlewares/authMiddleware.ts');

const app = express();

// ----- Middleware Setup -----
// Logging middleware (only active in non-test environments)
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Security headers
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data sanitization middleware
app.use(xss());
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// CORS setup
app.use(cors());
app.options('*', cors());

// ----- Authentication & Authorization -----
// JWT Authentication setup
// app.use(authMiddleware);

// Rate limiting for authentication routes (only in production)
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// ----- Route Handling -----
// API routes
app.use('/v1', routes);

// Root route (for basic checks)
app.use('/beaches', (req, res) => {
  res.json({
    beaches: [
      {
        name: 'Bondi Beach',
        location: 'Sydney, Australia',
      },
      {
        name: 'Manly Beach',
        location: 'Sydney, Australia',
      },
      {
        name: 'Cottesloe Beach',
        location: 'Perth, Australia',
      },
      {
        name: 'Surfers Paradise',
        location: 'Gold Coast, Australia',
      },
      {
        name: 'Kondalilla Falls',
        location: 'Sunshine Coast, Australia',
      },
    ],
  });
});

// ----- Error Handling -----
// 404 for any unknown routes
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert errors to ApiError format
app.use(errorConverter);

// Final error handler
app.use(errorHandler);

module.exports = app;
