/* eslint-disable prettier/prettier */
import { Brand, BrandUser, Consumer, Prisma, Role, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

const getBrandUserByMobileNumber = async (
    countryCode: string,
    mobileNumber: string,
): Promise<BrandUser & { userRole: UserRole } | null> => {
    const brandUser = await prisma.brandUser.findFirst({
        include: {
            userRole: true
        },
        where: { countryCode: countryCode, mobileNumber: mobileNumber }
    });

    return brandUser;
};

// insertBrand(countryCode, mobileNumber, requestId, regCode)
const insertBrand = async <Key extends keyof BrandUser>(
    countryCode: string,
    mobileNumber: string,
    requestId: string,
    regCode: string,
    keys: Key[] = [
        'id'
    ] as Key[]
): Promise<Pick<BrandUser, Key> | null> => {
    // create role for this user in the user role table
    // insert user into the consumer table
    const result = await prisma.$transaction(async (prisma) => {
        const regCodeEntry = await prisma.brandRegistrationCode.update({
            where: { code: regCode },
            data: { isUsed: true },
        });

        if (!regCodeEntry) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update registration code");
        }

        // First query: Create a new user
        const newBrandAdminRole = await prisma.userRole.create({
            data: {
                role: Role.BrandAdmin
            }
        });

        if (!newBrandAdminRole) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create new brand admin role");
        }

        const brand = await prisma.brand.create({
            data: {
            }
        });

        if (!brand) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create new brand");
        }

        // Second query: Use the userId from the previous query to create a post
        const brandAdmin = await prisma.brandUser.create({
            data: {
                countryCode: countryCode,
                mobileNumber: mobileNumber,
                userRoleId: newBrandAdminRole.id,
                otpVerified: true,
                otpVerificationRequestId: requestId,
                brandId: brand.id
            }
        });

        if (!brandAdmin) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create Admin for the brand.");
        }

        return { brand, brandAdmin };
    });

    return result.brandAdmin;
};

export default {
    getBrandUserByMobileNumber,
    insertBrand
};
