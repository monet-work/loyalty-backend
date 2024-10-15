import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';
import logger from './config/logger';
import redisClient from './config/redis';
import { sendOTP } from './utils/otpless';

let server: Server;
prisma.$connect().then(() => {
  logger.info('Connected to SQL Database');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const servicesDisconnect = async () => {
  await prisma.$disconnect();
  await redisClient.disconnect();
}

process.on('SIGINT', async () => {
  console.log('SIGINT');
  await servicesDisconnect();
  // do whatever to terminate properly
  // at worst, just 'exit(0)'
  process.exit(0);
});

const exitHandler = async () => {
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      await servicesDisconnect();
      process.exit(1);
    });
  } else {
    await servicesDisconnect();
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
  await servicesDisconnect();
  process.exit(0);
});
