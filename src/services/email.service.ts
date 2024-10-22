/* eslint-disable prettier/prettier */
import { Email } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import { verifyEmail as otplessVerifyEmail } from '../utils/otpless';

const insertEmail = async <Key extends keyof Email>(
  email: string,
  otplessRequestId: string,
  keys: Key[] = [
    'email', 'otp', 'expiresAt'
  ] as Key[]
): Promise<Pick<Email, Key> | null> => {
  try {
    const emailRow = await prisma.email.create({
      data: {
        requestId: otplessRequestId,
        email: email
      }
    });

    return emailRow;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

const verifyEmail = async <Key extends keyof Email>(
  email: string,
  requestId: string,
  otp: string,
  keys: Key[] = [
    'email', 'otp', 'expiresAt'
  ] as Key[]
): Promise<Pick<Email, Key> | null> => {
  try {
    // console.log(requestId,
    //     countryCode,
    //     mobileNumber);
    const emailRow = await prisma.email.findFirst({
      where: {
        requestId: requestId,
        email: email
      }
    });

    if (!emailRow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Verification Failed.');
    }

    const otplessVerifyResponse = await otplessVerifyEmail("", "", requestId, otp);

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

    return emailRow;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default {
  insertEmail,
  verifyEmail
};
