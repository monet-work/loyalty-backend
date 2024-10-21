/* eslint-disable prettier/prettier */
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
import xss from './middlewares/xss';
// import { jwtStrategy } from './config/passport';
import { authLimiter, otpBrandRateLimiter, otpRateLimiter, signUpBrandRateLimiter, signUpRateLimiter } from './middlewares/rateLimiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import { BRAND_ROUTES, CONSUMER_ROUTES, JWT_STRATEGY_BRAND, JWT_STRATEGY_CONSUMER, TOKEN_EXPIRED_MESSAGE } from './config/constants';
import { jwtBrandStrategy, jwtStrategy } from './config/passport';
// import { NextFunction } from 'connect';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

const conditionalJsonMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('application/json')) {
    // parse json request body
    express.json()(req, res, next); // Apply express.json() for JSON requests
  } else if (req.is('application/x-www-form-urlencoded')) {
    // parse urlencoded request body
    express.urlencoded({ extended: true })(req, res, next); // Apply express.urlencoded() for URL-encoded form data
  } else if (req.is('multipart/form-data')) {
    next(); // Apply multer for multipart/form-data (assuming single file upload with field name 'image')
  } else {
    next(); // Skip middleware if the Content-Type is not recognized
  }
}

app.use(conditionalJsonMiddleware);

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use(JWT_STRATEGY_CONSUMER, jwtStrategy);
passport.use(JWT_STRATEGY_BRAND, jwtBrandStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1' + CONSUMER_ROUTES.signUp, signUpRateLimiter);
  app.use('/v1' + CONSUMER_ROUTES.verifyOTP, otpRateLimiter);

  app.use('/v1' + CONSUMER_ROUTES.login, authLimiter);
  app.use('/v1' + CONSUMER_ROUTES.verifyOTP, otpRateLimiter);

  app.use('/v1' + BRAND_ROUTES.signUp, signUpBrandRateLimiter);
  app.use('/v1' + CONSUMER_ROUTES.verifyOTP, otpBrandRateLimiter);

  app.use('/v1' + BRAND_ROUTES.login, authLimiter);
  app.use('/v1' + BRAND_ROUTES.loginVerifyOTP, otpBrandRateLimiter);
}

// v1 api routes
app.use('/v1', routes);

// app.use((err: any, req: Request, res: Response, next: Function) => {
//   console.log("err: ", err);
//   if (err && err.message === TOKEN_EXPIRED_MESSAGE) {
//     return res.status(401.1).json({ message: 'Your token has expired. Please login again.' });
//   }
//   next(err); // Pass any other errors to the default error handler
// });

app.use('/health', (req, res, next) => {
  res.status(200).send({
    message: "Server is running"
  });
  return;
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
