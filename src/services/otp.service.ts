/* eslint-disable prettier/prettier */
import { OTP } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import { verifyOTP as otplessVerifyOTP } from '../utils/otpless';

const insertOTP = async <Key extends keyof OTP>(
    countryCode: string,
    mobileNumber: string,
    otplessRequestId: string,
    keys: Key[] = [
        'countryCode', 'mobileNumber', 'otp', 'expiresAt'
    ] as Key[]
): Promise<Pick<OTP, Key> | null> => {
    try {
        const otpRow = await prisma.oTP.create({
            data: {
                requestId: otplessRequestId,
                countryCode: countryCode,
                mobileNumber: mobileNumber,
            }
        });

        return otpRow;
    } catch (error) {
        console.error(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
};

const verifyOTP = async <Key extends keyof OTP>(
    countryCode: string,
    mobileNumber: string,
    requestId: string,
    otp: string,
    keys: Key[] = [
        'countryCode', 'mobileNumber', 'otp', 'expiresAt'
    ] as Key[]
): Promise<Pick<OTP, Key> | null> => {
    try {
        // console.log(requestId,
        //     countryCode,
        //     mobileNumber);
        const otpRow = await prisma.oTP.findFirst({
            where: {
                requestId: requestId,
                countryCode: countryCode,
                mobileNumber: mobileNumber
            }
        });

        if (!otpRow) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Verification Failed.');
        }

        const otplessVerifyResponse = await otplessVerifyOTP(countryCode, mobileNumber, requestId, otp);

        if (!otplessVerifyResponse.isOTPVerified) {
            throw new ApiError(otplessVerifyResponse.status, otplessVerifyResponse.message);
        }

        // otp verified successfully
        // remove other entries for this user
        // try {
        //     await prisma.oTP.deleteMany({
        //         where: {
        //             countryCode: countryCode,
        //             mobileNumber: mobileNumber
        //         }
        //     });
        // } catch (err) {
        //     console.error(err);
        // }

        return otpRow;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default {
    insertOTP,
    verifyOTP
};
