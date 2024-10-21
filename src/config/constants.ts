/* eslint-disable prettier/prettier */
export const CONSUMER_ROUTES = {
    "signUp": '/signup',
    "verifyOTP": '/verify-otp',
    "login": "/login",
    "loginVerifyOTP": "/login/verify-otp",
    "getDashboard": "/dashboard",
    "updateProfile": "/:consumerId/profile"
};

export const BRAND_ROUTES = {
    "signUp": '/signup',
    "verifyOTP": '/verify-otp',
    "login": "/login",
    "loginVerifyOTP": "/login/verify-otp",
    "getDashboard": "/dashboard",
    "updateProfile": "/:brandId/profile",
    "addPOCRequest": "/:brandId/pocs/send-otp",
    "verifyPOCRequest": "/:brandId/pocs/verify-otp",
};

export const AUTH_ROUTES = {
    "logout": "/logout",
    "refreshTokens": "/refresh-tokens"
};

export const JWT_STRATEGY_CONSUMER = "jwt-consumer";
export const JWT_STRATEGY_BRAND = "jwt-brand";
export const OTP_EXPIRY = 120; // in seconds
export const OTP_LENGTH = 6;
export const REG_CODE_LENGTH = 6;
export const OTP_CHANNEL_WHATSAPP = 'WHATSAPP';
export const OTP_CHANNEL_SMS = 'SMS';
export const TOKEN_EXPIRED_MESSAGE = 'Token expired';
export const TOKEN_EXPIRED_ERROR = 'TokenExpiredError';
export const ACCESS_TOKEN_EXPIRED_STATUS = 440;
export const PROFILE_PICTURE = 'profilePicture';