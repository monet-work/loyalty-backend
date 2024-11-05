/* eslint-disable prettier/prettier */
export const CONSUMER_ROUTES = {
    "signUp": '/signup',
    "verifyOTP": '/verify-otp',
    "login": "/login",
    "loginVerifyOTP": "/login/verify-otp",
    "getDashboard": "/dashboard",
    "updateProfile": "/:consumerId/profile",
    "linkBrandProfile": "/:consumerId/link-brand-profile",
    "verifyBrandProfileRequest": "/:consumerId/verify-brand-profile",
    "transferPoints": "/:consumerId/transfer-points",
    "brandAccounts": "/:consumerId/brand-accounts",
    "linkedBrandAccounts": "/:consumerId/linked-brand-accounts",
    "linkedBrandAccount": "/:consumerId/linked-brand-accounts/:brandAccountId"
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
    "sendEmailRequest": "/:brandId/send-email",
    "verifyEmailRequest": "/:brandId/verify-email",
    "updateBusinessInfo": "/:brandId/business-info"
};

export const AUTH_ROUTES = {
    "logout": "/logout",
    "refreshTokens": "/refresh-tokens"
};

export const JWT_STRATEGY_CONSUMER = "jwt-consumer";
export const JWT_STRATEGY_BRAND = "jwt-brand";
export const OTP_EXPIRY = 120; // in seconds
export const OTP_EXPIRY_EMAIL = 60 * 60; // in seconds
export const OTP_LENGTH = 6;
export const REG_CODE_LENGTH = 6;
export const OTP_CHANNEL_WHATSAPP = 'WHATSAPP';
export const OTP_CHANNEL_SMS = 'SMS';
export const OTP_CHANNEL_EMAIL = 'EMAIL';
export const TOKEN_EXPIRED_MESSAGE = 'Token expired';
export const TOKEN_EXPIRED_ERROR = 'TokenExpiredError';
export const ACCESS_TOKEN_EXPIRED_STATUS = 440;
export const EMAIL_VERIFICATION_REQUIRED_STATUS = 440.1;
export const BUSINESS_INFO_REQUIRED_STATUS = 440.2;
export const INTEGRATION_COMPLETED_STATUS = 440.3;
export const PROFILE_PICTURE = 'profilePicture';
export const EXPIRY_DAYS_FOR_NEWLY_ISSUED_POINTS = 14;