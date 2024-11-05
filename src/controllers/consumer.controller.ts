/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { consumerService, emailService, otpService } from '../services';
import { sendEmail, sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Consumer, Role, ConsumerBrandAccount } from '@prisma/client';
import authService from '../services/auth.service';

const getDashboard = catchAsync(async (req, res) => {
    console.log("getDashboard: ", req.user);
    res.status(200)
        .send({
            message: "Apple"
        });
    return;
});

const _linkBrandProfile = catchAsync(async (req, res) => {
    console.log("getDashboard: ", req.user);
    res.status(200)
        .send({
            message: "Apple"
        });
    return;
});

const linkBrandProfile = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber, email, brandId } = req.body;

    const consumerId = (req.user as Consumer).id;

    const brandProfileRequest = await consumerService.createBrandProfileRequest(consumerId, brandId, countryCode, mobileNumber, email);

    if (brandProfileRequest) {
        let otplessRequestData;
        if (email) {
            otplessRequestData = await sendEmail(email);
        } else {
            otplessRequestData = await sendOTP(countryCode, mobileNumber);
        }

        if (otplessRequestData.requestId) {
            if (email) {
                emailService.insertEmail(email, otplessRequestData.requestId);
            } else {
                otpService.insertOTP(countryCode, mobileNumber, otplessRequestData.requestId);
            }

            // store it in database
            res.status(otplessRequestData.status)
                .send({
                    requestId: otplessRequestData.requestId,
                    message: "OTP sent successfully",
                    id: brandProfileRequest.id
                });
            return;
        }

        res.status(otplessRequestData.status)
            .send({
                message: otplessRequestData.message
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to create request for linking consumer profile with brand"
            });
        return;
    }
});

const verifyBrandProfileRequest = catchAsync(async (req, res) => {
    const { id, requestId, otp } = req.body;

    let consumerBrandAccount = await consumerService.findConsumerBrandAccountById(id);

    if (consumerBrandAccount && !consumerBrandAccount.verified) {
        let otpData;
        if (consumerBrandAccount.email) {
            otpData = await emailService.verifyEmail(consumerBrandAccount.email, requestId, otp);
        } else {
            otpData = await otpService.verifyOTP(consumerBrandAccount.countryCode!, consumerBrandAccount.mobileNumber!, requestId, otp);
        }

        if (otpData) {
            consumerBrandAccount = await consumerService.verifyConsumerBrandAccount(id, requestId);

            if (consumerBrandAccount) {
                res.status(httpStatus.OK)
                    .send({
                        message: "OTP verified successfully.",
                        id: consumerBrandAccount.id,
                        points: 100
                    });
                return;
            }

            res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .send({
                    message: "Failed to link consumer profile with brand.",
                });
            return;
        } else {
            res.status(httpStatus.BAD_REQUEST)
                .send({
                    message: "OTP verification failed."
                });
            return;
        }
    } else {
        res.status(httpStatus.NOT_FOUND)
            .send({
                message: "Request not found or already verified."
            });
        return;
    }
});

const transferPoints = catchAsync(async (req, res) => {
    const { fromBrandId,
        toBrandId,
        points } = req.body;

    const consumerId = (req.user as Consumer).id;

    let pointsTransfer = await consumerService.transferPoints(consumerId, fromBrandId, toBrandId, points);

    if (pointsTransfer) {
        res.status(httpStatus.OK)
            .send({
                message: "Points transferred successfully"
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "An unexpected error occurred while processing the points transfer."
            });
        return;
    }
});

const brandAccounts = catchAsync(async (req, res) => {
    const consumerId = (req.user as Consumer).id;

    let brandAccounts = await consumerService.findBrandAccounts(consumerId);
    let brands = await consumerService.findBrandsForProfile(consumerId);

    if (brandAccounts && brands) {
        res.status(httpStatus.OK)
            .send({
                accounts: brandAccounts,
                brands: brands,
                message: "Brand accounts fetched successfully"
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "An unexpected error occurred while getting the brand accounts for the consumer."
            });
        return;
    }
});

export default {
    getDashboard,
    linkBrandProfile,
    verifyBrandProfileRequest,
    transferPoints,
    brandAccounts
};
