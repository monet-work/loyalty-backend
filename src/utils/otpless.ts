/* eslint-disable prettier/prettier */
import axios, { AxiosError } from 'axios';
import config from "../config/config";
import { OTP_CHANNEL_EMAIL, OTP_CHANNEL_SMS, OTP_CHANNEL_WHATSAPP, OTP_EXPIRY, OTP_EXPIRY_EMAIL, OTP_LENGTH } from "../config/constants";
import httpStatus from 'http-status';

const otplessAppId = config.otplessAppId,
    otplessclientId = config.otplessClientId,
    otplessclientSecret = config.otplessClientSecret;

const otplessSendOTPUrl = config.otplessSendOTPUrl,
    otplessVerifyOTPUrl = config.otplessVerifyOTPUrl,
    otplessSendEmailUrl = config.otplessSendEmailUrl,
    otplessVerifyEmailUrl = config.otplessVerifyEmailUrl;

export const sendOTP = async (countryCode: string, phoneNumber: string) => {
    try {
        // Replace with your third-party OTP service API endpoint and credentials
        const response = await axios.post(otplessSendOTPUrl, {
            phoneNumber: countryCode + phoneNumber,
            expiry: OTP_EXPIRY,
            otpLength: OTP_LENGTH,
            channels: [OTP_CHANNEL_WHATSAPP, OTP_CHANNEL_SMS]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': otplessclientId,
                'clientSecret': otplessclientSecret
            }
        });

        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // Check response from third-party service
        if (response.status === httpStatus.OK) {
            return {
                status: response.status,
                message: 'OTP sent successfully',
                requestId: response.data.requestId // Example: if they return an OTP ID
            };
        } else {
            // Handle specific error messages based on the third-party response
            return {
                status: response.status,
                message: 'Failed to send OTP'
            };
        }
    } catch (error) {
        // Handle errors such as network issues, rate limiting, etc.
        if (axios.isAxiosError(error)) {
            console.error(error);
            if (error.response?.status === httpStatus.BAD_REQUEST) {
                return {
                    "message": "Invalid Request",
                    "errorCode": error.response?.status,
                    "status": error.response?.status,
                    "description": "Invalid request"
                };
            } else if (error.response?.status === httpStatus.UNAUTHORIZED) {
                return {
                    "message": "Access blocked",
                    "status": error.response?.status,
                    "description": "Access is blocked"
                };
            } else if (error.response?.status === httpStatus.INTERNAL_SERVER_ERROR) {
                return {
                    "message": "Something went wrong. Please try again!",
                    "status": error.response?.status,
                    "description": "OTPLess is down"
                };
            }
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        } else {
            // do something else
            // or creating a new error
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        }
    }
}

export const verifyOTP = async (countryCode: string, phoneNumber: string, requestId: string, otp: string) => {
    try {
        // Replace with your third-party OTP service API endpoint and credentials
        const response = await axios.post(otplessVerifyOTPUrl, {
            requestId: requestId,
            otp: otp
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': otplessclientId,
                'clientSecret': otplessclientSecret
            }
        });

        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // Check response from third-party service
        if (response.status === httpStatus.OK) {
            return {
                status: response.status,
                isOTPVerified: response.data.isOTPVerified,
                message: 'OTP verified successfully',
                requestId: response.data.requestId // Example: if they return an OTP ID
            };
        } else {
            // Handle specific error messages based on the third-party response
            return {
                status: response.status,
                message: 'Failed to verify OTP'
            };
        }
    } catch (error) {
        // Handle errors such as network issues, rate limiting, etc.
        if (axios.isAxiosError(error)) {
            console.error(error);
            if (error.response?.status === httpStatus.BAD_REQUEST) {
                return {
                    "message": "Invalid Request",
                    "errorCode": error.response?.status,
                    "status": error.response?.status,
                    "description": "Invalid request"
                };
            } else if (error.response?.status === httpStatus.UNAUTHORIZED) {
                return {
                    "message": "Access blocked",
                    "status": error.response?.status,
                    "description": "Access is blocked"
                };
            } else if (error.response?.status === httpStatus.INTERNAL_SERVER_ERROR) {
                return {
                    "message": "Something went wrong. Please try again!",
                    "status": error.response?.status,
                    "description": "OTPLess is down"
                };
            }
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        } else {
            // do something else
            // or creating a new error
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        }
    }
}

export const sendEmail = async (email: string) => {
    try {
        // Replace with your third-party OTP service API endpoint and credentials
        const response = await axios.post(otplessSendEmailUrl, {
            email: email,
            expiry: OTP_EXPIRY_EMAIL,
            otpLength: OTP_LENGTH,
            channels: [OTP_CHANNEL_EMAIL]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': otplessclientId,
                'clientSecret': otplessclientSecret
            }
        });

        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // Check response from third-party service
        if (response.status === httpStatus.OK) {
            return {
                status: response.status,
                message: 'OTP sent successfully',
                requestId: response.data.requestId // Example: if they return an OTP ID
            };
        } else {
            // Handle specific error messages based on the third-party response
            return {
                status: response.status,
                message: 'Failed to send OTP'
            };
        }
    } catch (error) {
        // Handle errors such as network issues, rate limiting, etc.
        if (axios.isAxiosError(error)) {
            console.error(error);
            if (error.response?.status === httpStatus.BAD_REQUEST) {
                return {
                    "message": "Invalid Request",
                    "errorCode": error.response?.status,
                    "status": error.response?.status,
                    "description": "Invalid request"
                };
            } else if (error.response?.status === httpStatus.UNAUTHORIZED) {
                return {
                    "message": "Access blocked",
                    "status": error.response?.status,
                    "description": "Access is blocked"
                };
            } else if (error.response?.status === httpStatus.INTERNAL_SERVER_ERROR) {
                return {
                    "message": "Something went wrong. Please try again!",
                    "status": error.response?.status,
                    "description": "OTPLess is down"
                };
            }
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        } else {
            // do something else
            // or creating a new error
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        }
    }
}

/**
 * 
curl --request POST \
  --url https://auth.otpless.app/auth/v1/initiate/otp \
  --header 'Content-Type: application/json' \
  --header 'clientId: <api-key>' \
  --header 'clientSecret: <api-key>' \
  --data '{
  "email": "your@email.com",
  "expiry": 30,
  "otpLength": 4,
  "channels": [
    "EMAIL"
  ],
  "metaData": {
    "key1": "Data1",
    "key2": "Data2"
  }
}'
 * @param countryCode 
 * @param phoneNumber 
 * @param requestId 
 * @param otp 
 * @returns 
 */
export const verifyEmail = async (countryCode: string, phoneNumber: string, requestId: string, otp: string) => {
    try {
        // Replace with your third-party OTP service API endpoint and credentials
        const response = await axios.post(otplessVerifyEmailUrl, {
            requestId: requestId,
            otp: otp
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': otplessclientId,
                'clientSecret': otplessclientSecret
            }
        });

        // console.log(response.data);
        // console.log(response.status);
        // console.log(response.statusText);
        // Check response from third-party service
        if (response.status === httpStatus.OK) {
            return {
                status: response.status,
                isOTPVerified: response.data.isOTPVerified,
                message: 'OTP verified successfully',
                requestId: response.data.requestId // Example: if they return an OTP ID
            };
        } else {
            // Handle specific error messages based on the third-party response
            return {
                status: response.status,
                message: 'Failed to verify OTP'
            };
        }
    } catch (error) {
        // Handle errors such as network issues, rate limiting, etc.
        if (axios.isAxiosError(error)) {
            console.error(error);
            if (error.response?.status === httpStatus.BAD_REQUEST) {
                return {
                    "message": "Invalid Request",
                    "errorCode": error.response?.status,
                    "status": error.response?.status,
                    "description": "Invalid request"
                };
            } else if (error.response?.status === httpStatus.UNAUTHORIZED) {
                return {
                    "message": "Access blocked",
                    "status": error.response?.status,
                    "description": "Access is blocked"
                };
            } else if (error.response?.status === httpStatus.INTERNAL_SERVER_ERROR) {
                return {
                    "message": "Something went wrong. Please try again!",
                    "status": error.response?.status,
                    "description": "OTPLess is down"
                };
            }
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        } else {
            // do something else
            // or creating a new error
            return {
                "message": "Something went wrong. Please try again!",
                "status": httpStatus.INTERNAL_SERVER_ERROR,
                "description": "Unknown error"
            };
        }
    }
}