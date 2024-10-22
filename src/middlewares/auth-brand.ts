/* eslint-disable prettier/prettier */
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { allRightsForUser, roleRights, roles } from '../config/roles';
import { NextFunction, Request, Response } from 'express';
import { Brand, BrandUser, Consumer, UserRole } from '@prisma/client';
import { ACCESS_TOKEN_EXPIRED_STATUS, EMAIL_VERIFICATION_REQUIRED_STATUS, JWT_STRATEGY_BRAND, JWT_STRATEGY_CONSUMER, TOKEN_EXPIRED_ERROR } from '../config/constants';

type BrandWithUserRole = BrandUser & { userRole: UserRole | null, brand: Brand | null };

const verifyCallback =
    (
        req: Request,
        resolve: (value?: unknown) => void,
        reject: (reason?: unknown) => void,
        requiredRights: string[]
    ) =>
        async (err: unknown, user: BrandWithUserRole | false, info: any) => {
            if (err) {
                console.error('Authentication error:', err);
                return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error during authentication.'));
            }

            // console.log(req.originalUrl);
            // console.log(req.path);
            const match = req.originalUrl.match(/\/v1\/brands\/([\w-]+)\/profile$/);
            const emailMatch = req.originalUrl.match(/\/v1\/brands\/([\w-]+)\/send-email$/);
            const verifyEmailMatch = req.originalUrl.match(/\/v1\/brands\/([\w-]+)\/verify-email$/);

            // console.log("match: ", match);

            if (!user) {
                console.warn('Authentication failed:', info);

                // Check for token expiry or other issues using the `info` object
                let message = 'Unauthorized access.';
                let status: any = httpStatus.UNAUTHORIZED;
                // console.log("info.name: ", info.name);
                if (info && info.name === TOKEN_EXPIRED_ERROR) {
                    message = 'Token has expired. Refreshing...';
                    status = ACCESS_TOKEN_EXPIRED_STATUS;
                } else if (info && info.message) {
                    message = info.message; // Use any specific message provided by the strategy
                }

                return reject(new ApiError(status, message));
            } else if (emailMatch || verifyEmailMatch) {
                const match = emailMatch || verifyEmailMatch;

                if (user.brand?.id !== match![1]) {
                    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access'));
                }

                req.user = user;

                if (requiredRights.length) {
                    const userRights = allRightsForUser([user.userRole!.role]) ?? [];
                    const hasRequiredRights = requiredRights.every((requiredRight) =>
                        userRights.includes(requiredRight)
                    );
                    if (!hasRequiredRights) {
                        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
                    }
                }

                resolve();
            } else if (match) {
                console.log("req.body: ", req.body);
                if (user.brand?.id !== match[1]) {
                    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access'));
                }

                if (user.brand?.name && user.brand?.profilePictureURL) {
                    return reject(new ApiError(httpStatus.CONFLICT, 'Profile already completed'));
                }

                req.user = user;

                if (requiredRights.length) {
                    const userRights = allRightsForUser([user.userRole!.role]) ?? [];
                    const hasRequiredRights = requiredRights.every((requiredRight) =>
                        userRights.includes(requiredRight)
                    );
                    if (!hasRequiredRights) {
                        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
                    }
                }

                resolve();
            } else {
                console.log("req.params: ", req.params);
                if (!user.brand?.isEmailVerified) {
                    return reject(new ApiError(EMAIL_VERIFICATION_REQUIRED_STATUS, "Please verify your email first."));
                }

                // check if the name, description and profilePictureURL exists or not
                if (!user.brand?.name || !user.brand?.profilePictureURL) {
                    return reject(new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Please complete your profile first."));
                }

                req.user = user;

                if (requiredRights.length) {
                    const userRights = allRightsForUser([user.userRole!.role]) ?? [];
                    const hasRequiredRights = requiredRights.every((requiredRight) =>
                        userRights.includes(requiredRight)
                    );
                    if (!hasRequiredRights) {
                        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
                    }
                }

                resolve();
            }
        };

const authBrand =
    (...requiredRights: string[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            return new Promise((resolve, reject) => {
                passport.authenticate(
                    JWT_STRATEGY_BRAND,
                    { session: false },
                    verifyCallback(req, resolve, reject, requiredRights)
                )(req, res, next);
            })
                .then(() => next())
                .catch((err) => next(err));
        };

export default authBrand;
