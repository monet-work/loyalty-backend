/* eslint-disable prettier/prettier */
import { Brand, Consumer, ConsumerBrandAccount, PointsTransfer, Prisma, Role, TransferStatus, ConsumerSessionId } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import { EXPIRY_DAYS_FOR_NEWLY_ISSUED_POINTS } from '../config/constants';
import { PartialBrand, PartialPointTransfer } from '../config/brand-types';
import { BrandAdapter } from '../adapter/brand-adapter';
import { ConsumerDashboardResponse } from '../config/consumer-types';
import { uuidV4 } from 'web3-utils';

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
                id: brandId,
                isIntegrationCompleted: true
            }
        });

        if (!brand) {
            throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
        }

        const account = await prisma.consumerBrandAccount.findFirst({
            where: {
                consumerId: consumerId,
                brandId: brandId,
                verified: true
            }
        });

        if (account) {
            throw new ApiError(httpStatus.CONFLICT, "Account already verified.");
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

const transferPoints = async (consumerId: string, fromBrandId: string, toBrandId: string, points: number): Promise<PointsTransfer | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // const result = await prisma.$transaction(async (prisma) => {
    // First query: Create a new user
    const fromBrand = await prisma.consumerBrandAccount.findFirst({
        include: {
            brand: {
                select: {
                    conversionRate: true,
                    brandIndustry: true
                }
            }
        },
        where: {
            consumerId: consumerId,
            brandId: fromBrandId,
            verified: true
        }
    });

    if (!fromBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, "Source Brand not linked");
    }

    const toBrand = await prisma.consumerBrandAccount.findFirst({
        include: {
            brand: {
                select: {
                    conversionRate: true,
                    brandIndustry: true
                }
            }
        },
        where: {
            consumerId: consumerId,
            brandId: toBrandId,
            verified: true
        }
    });

    if (!toBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, "Destination Brand not linked");
    }

    if (fromBrand.brand.brandIndustry === toBrand.brand.brandIndustry) {
        throw new ApiError(httpStatus.FORBIDDEN, "Points conversion not allowed in the same category");
    }

    const currentDate = new Date();
    const futureDate = new Date(currentDate);

    futureDate.setDate(futureDate.getDate() + EXPIRY_DAYS_FOR_NEWLY_ISSUED_POINTS);
    // 0.5 conversion rate means 1 point is 0.5 rs
    const pointsB = points * fromBrand.brand.conversionRate! / toBrand.brand.conversionRate!;

    let pointsTransfer = await prisma.pointsTransfer.create({
        data: {
            fromBrandId: fromBrandId,
            consumerId: consumerId,
            toBrandId: toBrandId,
            pointsTransferredFromA: points,
            pointsTransferredToB: pointsB,
            createdAt: new Date(),
            transferStatus: TransferStatus.PENDING,
            toExpiryDate: futureDate
        }
    });

    if (!pointsTransfer) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create points transfer request");
    }

    // Directly make the update call to the brand A to see if 100 points can be used
    // const resA = await brandAPIService.update(brandA);
    const brandAAdapter = new BrandAdapter(fromBrandId);
    const transferResponse = await brandAAdapter.transferPoints(fromBrand.email ? fromBrand.email : fromBrand.countryCode! + fromBrand.mobileNumber!, -1 * Number(points));
    // console.log('Transfer Response:', transferResponse);

    pointsTransfer = await prisma.pointsTransfer.update({
        data: {
            completedAt: new Date(),
            transferStatus: TransferStatus.BRAND1_UPDATE_SUCCESS,
            brandATransactionID: transferResponse.id
        },
        where: {
            id: pointsTransfer.id
        }
    });

    // update the points in brand B
    // const resB = await brandAPIService.update(brandB);
    // 
    const brandBAdapter = new BrandAdapter(toBrandId);
    const transferResponse2 = await brandBAdapter.transferPoints(toBrand.email ? toBrand.email : toBrand.countryCode! + toBrand.mobileNumber!, Number(pointsB));


    pointsTransfer = await prisma.pointsTransfer.update({
        data: {
            completedAt: new Date(),
            transferStatus: TransferStatus.COMPLETED,
            brandBTransactionID: transferResponse2.id
        },
        where: {
            id: pointsTransfer.id
        }
    });

    if (!pointsTransfer) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update points transfer after updating points");
    }

    return pointsTransfer;
}

const findBrandsForProfile = async (consumerId: string): Promise<PartialBrand[] | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // const result = await prisma.$transaction(async (prisma) => {
    // First query: Create a new user
    const brands = await prisma.brand.findMany({
        select: {
            id: true,
            name: true,
            profilePictureURL: true
        },
        where: {
            ConsumerBrandAccount: {
                none: {
                    consumerId: consumerId,
                    verified: true
                }
            }
        }
    });

    return brands;
}

const findBrandAccounts = async (consumerId: string): Promise<ConsumerBrandAccount[] | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // const result = await prisma.$transaction(async (prisma) => {
    // First query: Create a new user
    const accounts = await prisma.consumerBrandAccount.findMany({
        include: {
            brand: {
                select: {
                    id: true,
                    name: true,
                    profilePictureURL: true
                }
            }
        },
        where: {
            consumerId: consumerId,
            verified: true
        }
    });

    return accounts;
}

const findLinkedBrandAccounts = async (consumerId: string): Promise<ConsumerBrandAccount[] | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // const result = await prisma.$transaction(async (prisma) => {
    // First query: Create a new user
    const accounts = await prisma.consumerBrandAccount.findMany({
        include: {
            brand: {
                select: {
                    id: true,
                    name: true,
                    profilePictureURL: true,
                    conversionRate: true,
                    websiteURL: true,
                    brandIndustry: true
                }
            }
        },
        where: {
            consumerId: consumerId,
            verified: true
        }
    });

    return accounts;
}

const findLinkedBrandAccountById = async (consumerId: string, brandAccountId: string): Promise<ConsumerBrandAccount | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // const result = await prisma.$transaction(async (prisma) => {
    // First query: Create a new user
    const brandAccount = await prisma.consumerBrandAccount.findUnique({
        include: {
            brand: {
                select: {
                    id: true,
                    name: true,
                    profilePictureURL: true,
                    conversionRate: true,
                    websiteURL: true
                }
            }
        },
        where: {
            id: brandAccountId
        }
    });

    if (!brandAccount) {
        throw new ApiError(httpStatus.NOT_FOUND, "Brand account not found");
    }

    if (brandAccount.consumerId !== consumerId || !brandAccount.verified) {
        throw new ApiError(httpStatus.NOT_FOUND, "Brand account not found");
    }

    return brandAccount;
}

const getDashboardDetails = async (
    consumerId: string
): Promise<ConsumerDashboardResponse> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    // Second query: Use the userId from the previous query to create a post
    // const numberOfConsumers = await prisma.consumerBrandAccount.count({
    //     where: {
    //         brandId: brandId,
    //         verified: true
    //     }
    // });

    // const totalTradedInPoints = await prisma.pointsTransfer.aggregate({
    //     _sum: {
    //         pointsTransferredFromA: true
    //     },
    //     where: {
    //         fromBrandId: brandId
    //     }
    // });

    // const totalTradedOutPoints = await prisma.pointsTransfer.aggregate({
    //     _sum: {
    //         pointsTransferredToB: true
    //     },
    //     where: {
    //         toBrandId: brandId
    //     }
    // });

    return {
        id: consumerId,
        message: "hello"
    };
};

const findByDashboardSessionId = async (
    sessionId: string = "sessionId",
    consumerId: string = "consumerId"
): Promise<ConsumerSessionId | null> => {
    const consumerSession = await prisma.consumerSessionId.findFirst({
        where: {
            consumerId: consumerId,
            sessionId: sessionId
        }
    });

    await prisma.consumerSessionId.deleteMany({
        where: {
            consumerId: consumerId
        }
    });

    if (!consumerSession) {
        throw new ApiError(httpStatus.NOT_FOUND, "Session not found");
    }

    return consumerSession;
}

const insertSessionForConsumer = async (consumerId: string): Promise<ConsumerSessionId | null> => {
    await prisma.consumerSessionId.deleteMany({
        where: {
            consumerId: consumerId
        }
    });

    const consumerSession = await prisma.consumerSessionId.create({
        data: {
            consumerId: consumerId,
            sessionId: uuidV4()
        }
    });

    if (!consumerSession) {
        throw new ApiError(httpStatus.NOT_FOUND, "Session not found");
    }

    return consumerSession;
}


const findTransactions = async (
    consumerId: string
): Promise<PartialPointTransfer[] | null> => {
    const transactions = await prisma.pointsTransfer.findMany({
        select: {
            fromBrand: {
                select: {
                    name: true,
                    profilePictureURL: true,
                    brandSymbol: true,
                }
            },
            toBrand: {
                select: {
                    name: true,
                    profilePictureURL: true,
                    brandSymbol: true
                }
            },
            id: true,
            consumerId: true,
            pointsTransferredFromA: true,
            pointsTransferredToB: true
        },
        where: {
            consumerId: consumerId
        }
    });

    if (!transactions) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transactions not found");
    }

    return transactions;
}

const findTransactionById = async (
    transactionId: string
): Promise<PointsTransfer | null> => {
    const transaction = await prisma.pointsTransfer.findFirst({
        include: {
            fromBrand: {
                select: {
                    name: true,
                    profilePictureURL: true,
                    brandSymbol: true
                }
            },
            toBrand: {
                select: {
                    name: true,
                    profilePictureURL: true,
                    brandSymbol: true
                }
            },
            consumer: {
                select: {
                    name: true,
                    countryCode: true,
                    mobileNumber: true,
                    profilePictureURL: true
                }
            }
        },
        where: {
            id: transactionId
        }
    });

    if (!transaction) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    return transaction;
}

export default {
    getConsumerByMobileNumber,
    insertConsumer,
    updateConsumer,
    createBrandProfileRequest,
    findConsumerBrandAccountById,
    verifyConsumerBrandAccount,
    transferPoints,
    findBrandAccounts,
    findBrandsForProfile,
    findLinkedBrandAccounts,
    findLinkedBrandAccountById,
    getDashboardDetails,
    findByDashboardSessionId,
    insertSessionForConsumer,
    findTransactionById,
    findTransactions
};
