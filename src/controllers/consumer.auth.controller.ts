/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { consumerService, otpService } from '../services';
import { sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Role } from '@prisma/client';
import authService from '../services/auth.service';

const signUp = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber } = req.body;

    const consumer = await consumerService.getConsumerByMobileNumber(countryCode, mobileNumber);

    if (!consumer) {
        // send otp to consumer
        const otplessRequestData = await sendOTP(countryCode, mobileNumber);
        // store it in redis server
        if (otplessRequestData.requestId) {
            await otpService.insertOTP(countryCode, mobileNumber, otplessRequestData.requestId);
            // store it in database
            res.status(otplessRequestData.status)
                .send({
                    requestId: otplessRequestData.requestId,
                    message: "OTP sent successfully"
                });
            return;
        }

        res.status(otplessRequestData.status)
            .send({
                message: otplessRequestData.message
            });
        return;
    } else {
        res.status(httpStatus.CONFLICT)
            .send({
                message: "Phone number already registered. Try logging in instead."
            });
        return;
    }
});

const verifyOTP = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber, requestId, otp } = req.body;

    const otpData = await otpService.verifyOTP(countryCode, mobileNumber, requestId, otp);

    if (otpData) {
        // otp is verified successfully for signup
        // insert consumer into the database
        const consumer = await consumerService.insertConsumer(countryCode, mobileNumber, requestId);

        if (consumer) {
            // consumer has been created successfully
            // create a token and send it back to the consumer
            const tokens = await tokenService.generateAuthTokens(consumer, Role.BasicConsumer);
            res.status(httpStatus.OK)
                .send({
                    message: "OTP verified successfully.",
                    tokens: tokens
                });
            return;
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .send({
                    message: "Failed to sign up. Try again."
                });
            return;
        }
    } else {
        res.status(httpStatus.BAD_REQUEST)
            .send({
                message: "OTP verification failed."
            });
        return;
    }
});

const loginVerifyOTP = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber, requestId, otp } = req.body;

    const otpData = await otpService.verifyOTP(countryCode, mobileNumber, requestId, otp);

    if (otpData) {
        // otp is verified successfully for signup
        // insert consumer into the database
        const consumer = await consumerService.getConsumerByMobileNumber(countryCode, mobileNumber);

        if (consumer) {
            // consumer exists
            // create a token and send it back to the consumer
            const tokens = await tokenService.generateAuthTokens(consumer, Role.BasicConsumer);
            res.status(httpStatus.OK)
                .send({
                    message: "OTP verified successfully.",
                    tokens: tokens
                });
            return;
        } else {
            res.status(httpStatus.CONFLICT)
                .send({
                    message: "Consumer doesn't exist. Please sign up first."
                });
            return;
        }
    } else {
        res.status(httpStatus.BAD_REQUEST)
            .send({
                message: "OTP verification failed."
            });
        return;
    }
});

const login = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber } = req.body;

    const consumer = await consumerService.getConsumerByMobileNumber(countryCode, mobileNumber);

    if (consumer) {
        // send otp to consumer
        const otplessRequestData = await sendOTP(countryCode, mobileNumber);
        // store it in redis server
        if (otplessRequestData.requestId) {
            await otpService.insertOTP(countryCode, mobileNumber, otplessRequestData.requestId);
            // store it in database
            res.status(otplessRequestData.status)
                .send({
                    requestId: otplessRequestData.requestId,
                    message: "OTP sent successfully"
                });
            return;
        }

        res.status(otplessRequestData.status)
            .send({
                message: otplessRequestData.message
            });
        return;
    } else {
        res.status(httpStatus.CONFLICT)
            .send({
                message: "Consumer doesn't exist. Please sign up first."
            });
        return;
    }
});

export default {
    signUp,
    verifyOTP,
    login,
    loginVerifyOTP
};
