const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

const startServer = () => {
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
};

// Error handling for uncaught exceptions and unhandled promise rejections
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// handle SIGTERM (e.g., graceful shutdown on container termination)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

startServer();
