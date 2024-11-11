/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { brandService, consumerService, otpService } from '../services';
import { sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Brand, BrandUser, Role } from '@prisma/client';
import authService from '../services/auth.service';

const getDashboard = catchAsync(async (req, res) => {
    // console.log("getDashboard: ", req.user);
    const brandId = ((req.user as any).brand as Brand).id;

    const dashboard = await brandService.getDashboardDetails(brandId);

    if (!dashboard) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to get dashboard details for the brand"
            });
        return;
    }
    res.status(200)
        .send({
            ...dashboard,
            message: "Dashboard details for brand fetched successfully"
        });
    return;
});


const updateBusinessInfo = catchAsync(async (req, res) => {
    const { industry, category, conversionRate, brandSymbol } = req.body;

    const brandId = ((req.user as any).brand as Brand).id;

    const brand = await brandService.updateBusinessInfo(brandId, industry, category, conversionRate, brandSymbol);

    if (brand) {
        // brand's email has been verified successfully
        res.status(httpStatus.OK)
            .send({
                message: "Business Info updated successfully.",
                brand
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to update business info. Try again."
            });
        return;
    }
});

const findTransactions = catchAsync(async (req, res) => {
    const brandId = ((req.user as any).brand as Brand).id;

    const transactions = await brandService.findTransactions(brandId);

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
    const brandId = ((req.user as any).brand as Brand).id;
    const transactionId = req.params.transactionId;

    const transaction = await brandService.findTransactionById(transactionId);

    if (transaction) {
        // brand's email has been verified successfully
        if (transaction.fromBrandId === brandId || transaction.toBrandId === brandId) {
            res.status(httpStatus.OK)
                .send({
                    message: "Transaction fetched successfully.",
                    transaction
                });
            return;
        }
        res.status(httpStatus.UNAUTHORIZED)
            .send({
                message: "Brand unauthorised to see this transaction",
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

const getProfile = catchAsync(async (req, res) => {
    const brandUserId = (req.user as BrandUser).id;

    const profile = await brandService.findProfileById(brandUserId);

    if (profile) {
        res.status(httpStatus.OK)
            .send({
                profile: profile,
                message: "Consumer profile fetched successfully",
            });
        return;
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send({
                message: "Failed to find profile."
            });
        return;
    }
});

export default {
    getDashboard,
    updateBusinessInfo,
    findTransactions,
    findTransactionById,
    getProfile
};
