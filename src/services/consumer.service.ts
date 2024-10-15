/* eslint-disable prettier/prettier */
import { Consumer, Role } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

const getConsumerByMobileNumber = async <Key extends keyof Consumer>(
    countryCode: string,
    mobileNumber: string,
    keys: Key[] = [
        'id', 'countryCode', 'mobileNumber'
    ] as Key[]
): Promise<Pick<Consumer, Key> | null> => {
    return await prisma.consumer.findFirst({
        where: { countryCode: countryCode, mobileNumber: mobileNumber },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    }) as Promise<Pick<Consumer, Key> | null>;
};

const insertConsumer = async <Key extends keyof Consumer>(
    countryCode: string,
    mobileNumber: string,
    requestId: string,
    keys: Key[] = [
        'id', 'countryCode', 'mobileNumber'
    ] as Key[]
): Promise<Pick<Consumer, Key> | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const result = await prisma.$transaction(async (prisma) => {
        // First query: Create a new user
        const newConsumerRole = await prisma.userRole.create({
            data: {
                role: Role.BasicConsumer
            }
        });

        if (!newConsumerRole) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create new consumer role");
        }
        // Second query: Use the userId from the previous query to create a post
        const consumer = await prisma.consumer.create({
            data: {
                countryCode: countryCode,
                mobileNumber: mobileNumber,
                userRoleId: newConsumerRole.id,
                otpVerified: true,
                otpVerificationRequestId: requestId
            }
        });

        if (!consumer) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create new consumer");
        }

        return { consumer };
    });

    return result.consumer;
};

export default {
    getConsumerByMobileNumber,
    insertConsumer
};
