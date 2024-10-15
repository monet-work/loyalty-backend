
/* eslint-disable prettier/prettier */
import { BrandRegistrationCode } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

const findValidRegistrationCode = async <Key extends keyof BrandRegistrationCode>(
    countryCode: string,
    mobileNumber: string,
    code: string,
    keys: Key[] = [
        'id'
    ] as Key[]
): Promise<Pick<BrandRegistrationCode, Key> | null> => {
    try {
        const registrationCode = await prisma.brandRegistrationCode.findFirst({
            where: {
                countryCode: countryCode,
                mobileNumber: mobileNumber,
                code,
                isUsed: false,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });

        return registrationCode;
    } catch (error) {
        console.error('Error finding registration code:', error);
        throw new ApiError(httpStatus.NOT_FOUND, "Could not fetch registration code");
    };
}

export default {
    findValidRegistrationCode,
}
