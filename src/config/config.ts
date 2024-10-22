import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    DATABASE_URL: Joi.string().description('database url'),
    REDIS_URL: Joi.string().description('redis server URL'),
    OTPLESS_APP_ID: Joi.string().description('otpless app id'),
    OTPLESS_CLIENT_ID: Joi.string().description('otpless client id'),
    OTPLESS_CLIENT_SECRET: Joi.string().description('otpless client secret'),
    OTPLESS_SEND_OTP_URL: Joi.string().description('otpless send otp url'),
    OTPLESS_VERIFY_OTP_URL: Joi.string().description('otpless verify otp url'),
    OTPLESS_SEND_EMAIL_URL: Joi.string().description('otpless send email url'),
    OTPLESS_VERIFY_EMAIL_URL: Joi.string().description('otpless verify email url'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM
  },
  redisURL: envVars.REDIS_URL,
  databaseURL: envVars.DATABASE_URL,
  otplessAppId: envVars.OTPLESS_APP_ID,
  otplessClientId: envVars.OTPLESS_CLIENT_ID,
  otplessClientSecret: envVars.OTPLESS_CLIENT_SECRET,
  otplessSendOTPUrl: envVars.OTPLESS_SEND_OTP_URL,
  otplessVerifyOTPUrl: envVars.OTPLESS_VERIFY_OTP_URL,
  otplessSendEmailUrl: envVars.OTPLESS_SEND_EMAIL_URL,
  otplessVerifyEmailUrl: envVars.OTPLESS_VERIFY_EMAIL_URL
};