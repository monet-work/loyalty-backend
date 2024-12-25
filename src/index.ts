import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';
import logger from './config/logger';
// import redisClient from './config/redis';
import { sendOTP } from './utils/otpless';


import { BrandAdapter } from './adapter/brand-adapter';
import { PointEntry } from './config/brand-types';

// Example function to demonstrate usage of the adapter
// async function exampleUsage() {
//   try {
//     // Initialize adapter for a specific brand, e.g., 'brandA' from your config
//     const brandAdapter = new BrandAdapter('b1be31f7-40f6-4475-b04e-c8040ca60b4a');

//     // Example user ID for fetching points
//     const userId = '+918792362659';
//     // const userId = "alice@example.com";

//     // Fetch points for the user
//     const points: PointEntry[] = await brandAdapter.fetchPoints(userId);
//     console.log('User Points:', points);

//     // Example data for transferring points
//     const fromUserId = '+912121212121';
//     const pointsToTransfer = -200;

//     // // Transfer points from one user to another
//     const transferResponse = await brandAdapter.transferPoints(fromUserId, pointsToTransfer);
//     console.log('Transfer Response:', transferResponse);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Call the example function
// exampleUsage();

let server: Server;
prisma.$connect().then(() => {
  logger.info('Connected to SQL Database');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const servicesDisconnect = async () => {
  await prisma.$disconnect();
  // await redisClient.disconnect();
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
