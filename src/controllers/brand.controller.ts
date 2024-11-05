/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { brandService, consumerService, otpService } from '../services';
import { sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Brand, Role } from '@prisma/client';
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

export default {
    getDashboard,
    updateBusinessInfo
};
