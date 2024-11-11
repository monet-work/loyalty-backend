/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { consumerService, emailService, otpService } from '../services';
import { sendEmail, sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Consumer, Role, ConsumerBrandAccount } from '@prisma/client';
import authService from '../services/auth.service';
import { BrandAdapter } from '../adapter/brand-adapter';
import { PointEntry } from '../config/brand-types';
import { ConsumerDashboardResponse } from '../config/consumer-types';
import { Response } from 'express';

const sendData = (res: Response, data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const getDashboardDetails = catchAsync(async (req, res) => {
    // console.log("getDashboard: ", req.user);
    const sessionId = req.query.sessionId as string;
    const consumerId = req.query.consumerId as string;

    const consumerSession = await consumerService.findByDashboardSessionId(sessionId, consumerId);

    if (!consumerSession) {
        res.status(httpStatus.UNAUTHORIZED)
            .send({
                message: "Session not authorized"
            });
        return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const accounts = await consumerService.findLinkedBrandAccounts(consumerId);

    const brandAdapters: BrandAdapter[] = [];

    accounts!.forEach(account => {
        const brandAdapter = new BrandAdapter(account.brandId);
        brandAdapters.push(brandAdapter);
    });

    const apiCalls: Promise<any>[] = [];

    brandAdapters.forEach((brandAdapter, idx) => {
        apiCalls.push(brandAdapter.fetchPoints(accounts![idx].email ? accounts![idx].email! : accounts![idx].countryCode! + accounts![idx].mobileNumber!));
    })

    apiCalls.forEach((apiCall, index) => {
        apiCall
            .then(data => {
                sendData(res, { part: index + 1, points: data, account: accounts![index] });
            })
            .catch(error => {
                sendData(res, { part: index + 1, error: 'Failed to fetch data' });
            });
    });

    // Send a 'complete' event once all API calls are finished
    Promise.allSettled(apiCalls).then(() => {
        res.write('event: complete\n');
        res.write('data: {}\n\n');
        res.end();
    });
});

const getDashboard = catchAsync(async (req, res) => {
    // console.log("getDashboard: ", req.user);
    const consumerId = (req.user as Consumer).id;

    const consumerSession = await consumerService.insertSessionForConsumer(consumerId);

    if (consumerSession) {
        res.status(httpStatus.OK)
            .send({
                session: consumerSession,
                message: "Session created successfully"
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "An unexpected error occurred while creating the dashboard session for consumer."
            });
        return;
    }
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
            const brandAdapter = new BrandAdapter(consumerBrandAccount.brandId);

            // const userId = "alice@example.com";

            // Fetch points for the user
            try {
                const points: PointEntry[] = await brandAdapter.fetchPoints(consumerBrandAccount.email ? consumerBrandAccount.email : consumerBrandAccount.countryCode! + consumerBrandAccount.mobileNumber!);

                const totalPoints = points.reduce((accumulator, point) => accumulator + Number(point.points), 0);

                consumerBrandAccount = await consumerService.verifyConsumerBrandAccount(id, requestId);

                if (consumerBrandAccount) {
                    res.status(httpStatus.OK)
                        .send({
                            message: "OTP verified successfully.",
                            id: consumerBrandAccount.id,
                            points: totalPoints
                        });
                    return;
                }
            } catch (e) {
                console.log(e);
                res.status(httpStatus.INTERNAL_SERVER_ERROR)
                    .send({
                        message: "Failed to link consumer profile with brand.",
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

const linkedBrandAccounts = catchAsync(async (req, res) => {
    const consumerId = (req.user as Consumer).id;

    let brandAccounts = await consumerService.findLinkedBrandAccounts(consumerId);
    let brands = await consumerService.findBrandsForProfile(consumerId);

    if (brandAccounts && brands) {
        res.status(httpStatus.OK)
            .send({
                accounts: brandAccounts,
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

const linkedBrandAccount = catchAsync(async (req, res) => {
    const consumerId = (req.user as Consumer).id;
    const brandId = req.params.brandAccountId;

    let brandDetails = await consumerService.findLinkedBrandAccountById(consumerId, brandId);

    if (brandDetails) {
        const brandAdapter = new BrandAdapter(brandDetails.brandId);

        // const userId = "alice@example.com";

        // Fetch points for the user
        const points: PointEntry[] = await brandAdapter.fetchPoints(brandDetails.email ? brandDetails.email : brandDetails.countryCode! + brandDetails.mobileNumber!);

        const totalPoints = points.reduce((accumulator, point) => accumulator + Number(point.points), 0);

        res.status(httpStatus.OK)
            .send({
                account: brandDetails,
                message: "Brand account fetched successfully",
                totalPoints: totalPoints
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


const findTransactions = catchAsync(async (req, res) => {
    const consumerId = (req.user as Consumer).id;

    const transactions = await consumerService.findTransactions(consumerId);

    if (transactions) {
        // brand's email has been verified successfully
        res.status(httpStatus.OK)
            .send({
                message: "Transactions fetched successfully.",
                transactions
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to find transactions. Try again later."
            });
        return;
    }
});

const findTransactionById = catchAsync(async (req, res) => {
    const consumerId = (req.user as Consumer).id;

    const transactionId = req.params.transactionId;

    const transaction = await consumerService.findTransactionById(transactionId);

    if (transaction) {
        // brand's email has been verified successfully
        if (transaction.consumerId === consumerId) {
            res.status(httpStatus.OK)
                .send({
                    message: "Transaction fetched successfully.",
                    transaction
                });
            return;
        }
        res.status(httpStatus.UNAUTHORIZED)
            .send({
                message: "Consumer unauthorised to see this transaction",
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to find transaction."
            });
        return;
    }
});

export default {
    getDashboard,
    getDashboardDetails,
    linkBrandProfile,
    verifyBrandProfileRequest,
    transferPoints,
    brandAccounts,
    linkedBrandAccounts,
    linkedBrandAccount,
    findTransactions,
    findTransactionById
};
