/* eslint-disable prettier/prettier */
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { allRightsForUser, roleRights, roles } from '../config/roles';
import { NextFunction, Request, Response } from 'express';
import { Consumer, UserRole } from '@prisma/client';
import { ACCESS_TOKEN_EXPIRED_STATUS, JWT_STRATEGY_BRAND, JWT_STRATEGY_CONSUMER, TOKEN_EXPIRED_ERROR } from '../config/constants';

type ConsumerWithUserRole = Consumer & { userRole: UserRole | null };

const verifyCallback =
    (
        req: Request,
        resolve: (value?: unknown) => void,
        reject: (reason?: unknown) => void,
        requiredRights: string[]
    ) =>
        async (err: unknown, user: ConsumerWithUserRole | false, info: any) => {
            if (err) {
                console.error('Authentication error:', err);
                return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error during authentication.'));
            }

            const match = req.originalUrl.match(/\/v1\/consumers\/([\w-]+)\/profile$/);

            if (!user) {
                console.warn('Authentication failed:', info);

                // Check for token expiry or other issues using the `info` object
                let message = 'Unauthorized access.';
                let status = httpStatus.UNAUTHORIZED;
                // console.log("info.name: ", info.name);
                if (info && info.name === TOKEN_EXPIRED_ERROR) {
                    message = 'Token has expired. Refreshing...';
                    status = ACCESS_TOKEN_EXPIRED_STATUS;
                } else if (info && info.message) {
                    message = info.message; // Use any specific message provided by the strategy
                }

                return reject(new ApiError(status, message));
            } else if (!match) {
                // check if the name, description and profilePictureURL exists or not
                if (!user.name) {
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
            } else {
                // it did match with the update profile
                // check if the user already has the entire profile setup or not
                if (user.name) {
                    // profile already completed
                    return reject(new ApiError(httpStatus.CONFLICT, 'Profile already completed'));
                }

                // allow the user to update the profile
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
        }

const auth =
    (...requiredRights: string[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            return new Promise((resolve, reject) => {
                passport.authenticate(
                    JWT_STRATEGY_CONSUMER,
                    { session: false },
                    verifyCallback(req, resolve, reject, requiredRights)
                )(req, res, next);
            })
                .then(() => next())
                .catch((err) => next(err));
        };


export default auth;
