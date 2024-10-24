/* eslint-disable prettier/prettier */
import { Consumer, ConsumerBrandAccount, Prisma, Role } from '@prisma/client';
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

const updateConsumer = async <Key extends keyof Consumer>(
    id: string,
    name: string,
    description: string,
    profilePictureURL: string | null,
    keys: Key[] = [
        'id', 'name', 'description', 'profilePictureURL'
    ] as Key[]
): Promise<Pick<Consumer, Key> | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const consumer = await prisma.consumer.update({
        data: {
            name: name,
            description: description,
            profilePictureURL: profilePictureURL
        },
        where: {
            id: id
        }
    })

    return consumer;
};

const createBrandProfileRequest = async <Key extends keyof ConsumerBrandAccount>(
    consumerId: string,
    brandId: string,
    countryCode: string | undefined | null,
    mobileNumber: string | undefined | null,
    email: string | undefined | null,
    keys: Key[] = [
        'id', 'countryCode', 'mobileNumber'
    ] as Key[]
): Promise<Pick<ConsumerBrandAccount, Key> | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const result = await prisma.$transaction(async (prisma) => {
        // First query: Create a new user
        const brand = await prisma.brand.findFirst({
            where: {
                id: brandId
            }
        });

        if (!brand) {
            throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
        }

        const consumerBrandAccountCreateInput: Prisma.ConsumerBrandAccountCreateManyInput = {
            brandId: brandId,
            consumerId: consumerId,
            // ...(role === Role.BasicConsumer ? { consumerId: userId } : { brandUserId: userId }),
            ...(email ? { email: email } : { countryCode: countryCode, mobileNumber: mobileNumber })
        };

        const consumerBrandAccount = await prisma.consumerBrandAccount.create({
            data: consumerBrandAccountCreateInput
        });

        if (!consumerBrandAccount) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create request for linking consumer with brand");
        }

        return { consumerBrandAccount };
    });

    return result.consumerBrandAccount;
};

const findConsumerBrandAccountById = async (
    id: string,
): Promise<ConsumerBrandAccount | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const consumerBrandAccount = await prisma.consumerBrandAccount.findFirst({
        where: {
            id: id,
        }
    });

    return consumerBrandAccount;
};

const verifyConsumerBrandAccount = async <Key extends keyof ConsumerBrandAccount>(
    id: string,
    requestId: string,
    keys: Key[] = [
        'id', 'countryCode', 'mobileNumber'
    ] as Key[]
): Promise<Pick<ConsumerBrandAccount, Key> | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const consumerBrandAccount = await prisma.consumerBrandAccount.update({
        data: {
            verified: true,
            verificationId: requestId
        },
        where: {
            id: id,
        }
    });

    return consumerBrandAccount;
};

export default {
    getConsumerByMobileNumber,
    insertConsumer,
    updateConsumer,
    createBrandProfileRequest,
    findConsumerBrandAccountById,
    verifyConsumerBrandAccount
};
