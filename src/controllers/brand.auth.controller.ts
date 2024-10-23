/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { brandRegCodeService, brandService, emailService, otpService } from '../services';
import { sendEmail, sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Brand, BrandUser, Role } from '@prisma/client';

const signUp = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber, regCode } = req.body;

    const regCodeEntry = await brandRegCodeService.findValidRegistrationCode(countryCode, mobileNumber, regCode);

    if (!regCodeEntry) {
        res.status(httpStatus.NOT_FOUND)
            .send({
                message: "Could not fetch registration code"
            });
        return;
    }

    const brandAdminUser = await brandService.getBrandUserByMobileNumber(countryCode, mobileNumber);

    if (!brandAdminUser) {
        // send otp to brand
        const otplessRequestData = await sendOTP(countryCode, mobileNumber);

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
    const { countryCode, mobileNumber, requestId, otp, regCode } = req.body;

    const regCodeEntry = await brandRegCodeService.findValidRegistrationCode(countryCode, mobileNumber, regCode);

    if (!regCodeEntry) {
        res.status(httpStatus.NOT_FOUND)
            .send({
                message: "Could not fetch registration code"
            });
        return;
    }

    const otpData = await otpService.verifyOTP(countryCode, mobileNumber, requestId, otp);

    if (otpData) {
        // otp is verified successfully for signup
        // insert consumer into the database
        const brandAdmin = await brandService.insertBrand(countryCode, mobileNumber, requestId, regCode);

        if (brandAdmin) {
            // consumer has been created successfully
            // create a token and send it back to the consumer
            const tokens = await tokenService.generateAuthTokens(brandAdmin, Role.BrandAdmin);
            res.status(httpStatus.OK)
                .send({
                    message: "OTP verified successfully.",
                    tokens: tokens,
                    id: brandAdmin.brandId
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
        const brandUser = await brandService.getBrandUserByMobileNumber(countryCode, mobileNumber);

        if (brandUser) {
            // consumer exists
            // create a token and send it back to the consumer
            const bradUser = await brandService.getBrandUserByMobileNumber(countryCode, mobileNumber);

            const tokens = await tokenService.generateAuthTokens(brandUser, bradUser!.userRole.role);

            res.status(httpStatus.OK)
                .send({
                    message: "OTP verified successfully.",
                    tokens: tokens,
                    id: brandUser.brandId
                });
            return;
        } else {
            res.status(httpStatus.CONFLICT)
                .send({
                    message: "User doesn't exist. Please sign up first."
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

    const brandUser = await brandService.getBrandUserByMobileNumber(countryCode, mobileNumber);

    if (brandUser) {
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
                message: "User doesn't exist. Please sign up first."
            });
        return;
    }
});

const updateProfile = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a valid image file.' });
    }

    const fileUrl = (req.file as Express.MulterS3.File).location; // Optional file URL

    const brand = await brandService.updateBrand(((req.user as any).brand as Brand).id, name, description, fileUrl);

    if (brand) {
        res.status(httpStatus.OK)
            .send({
                brand: brand,
                message: "Profile updated successfully"
            });
        return;
    }

    res.status(httpStatus.BAD_REQUEST)
        .send({
            message: "Failed to update profile"
        });
    return;
});

const addPOCRequest = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber } = req.body;

    const brandUser = await brandService.getBrandUserByMobileNumber(countryCode, mobileNumber);

    if (brandUser) {
        res.status(httpStatus.CONFLICT)
            .send({
                message: "Phone number already exists"
            });
        return;
    }

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
});

const verifyPOCRequest = catchAsync(async (req, res) => {
    const { countryCode, mobileNumber, requestId, otp } = req.body;

    const otpData = await otpService.verifyOTP(countryCode, mobileNumber, requestId, otp);
    const brandId = ((req.user as any).brand as Brand).id;

    if (otpData) {
        // otp is verified successfully for poc addition
        // insert brand poc into the database
        const brandPOC = await brandService.insertBrandPOC(countryCode, mobileNumber, requestId, brandId);

        if (brandPOC) {
            // brand poc has been created successfully
            res.status(httpStatus.OK)
                .send({
                    message: "Brand POC Created successfully."
                });
            return;
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .send({
                    message: "Failed to add poc."
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

const sendEmailRequest = catchAsync(async (req, res) => {
    const { email } = req.body;

    const isEmailVerified = ((req.user as any).brand as Brand).isEmailVerified;

    if (!isEmailVerified) {
        // send otp to brand
        const otplessRequestData = await sendEmail(email);

        if (otplessRequestData.requestId) {
            await emailService.insertEmail(email, otplessRequestData.requestId);
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
                message: "Email already verified."
            });
        return;
    }
});

const verifyEmailRequest = catchAsync(async (req, res) => {
    const { email, requestId, otp } = req.body;

    const otpData = await emailService.verifyEmail(email, requestId, otp);

    const brandId = ((req.user as any).brand as Brand).id;

    if (otpData) {
        // otp is verified successfully for signup
        // insert consumer into the database
        const brand = await brandService.updateEmailVerified(brandId, email, requestId);

        if (brand) {
            // brand's email has been verified successfully
            res.status(httpStatus.OK)
                .send({
                    message: "Email verified successfully.",
                    brand
                });
            return;
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .send({
                    message: "Failed to verify email. Try again."
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


export default {
    signUp,
    verifyOTP,
    login,
    loginVerifyOTP,
    updateProfile,
    addPOCRequest,
    verifyPOCRequest,
    sendEmailRequest,
    verifyEmailRequest,
};
