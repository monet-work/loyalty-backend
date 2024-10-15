/* eslint-disable prettier/prettier */
import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import config from '../config/config';
import ApiError from '../utils/ApiError';
import { Prisma, Role, Token, TokenType } from '@prisma/client';
import prisma from '../client';
import { AuthTokensResponse, CustomJWTPayload } from '../types/response';

/**
 * Generate token
 * @param {number} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
    userId: string,
    expires: Moment,
    type: TokenType,
    secret: string = config.jwt.secret,
    role: Role = Role.BasicConsumer
): string => {
    const payload: CustomJWTPayload = {
        sub: userId,
        role: role,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    };

    return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {number} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (
    token: string,
    userId: string,
    expires: Moment,
    type: TokenType,
    blacklisted = false,
    role: Role = Role.BasicConsumer
): Promise<Token> => {
    console.log("saveToken: fields: ", token,
        userId,
        expires,
        type,
        blacklisted,
        role);
    const fields: Prisma.TokenCreateInput = {
        token,
        expires: expires.toDate(),
        type,
        blacklisted,
        ...(role === Role.BasicConsumer ? { consumerId: userId } : { brandUserId: userId }),
        role: role
    };

    const createdToken = await prisma.token.create({
        data: fields
    });

    return createdToken;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
    const payload = jwt.verify(token, config.jwt.secret) as unknown as CustomJWTPayload;
    console.log("payload: ", payload);
    const userId = String(payload.sub);
    const role = String(payload.role);
    console.log("role: ", role);
    console.log(role === Role.BasicConsumer ? { consumerId: userId } : { brandUserId: userId });
    const fields: Prisma.TokenFindFirstArgs = {
        where: {
            token,
            type,
            blacklisted: false,
            role: role as Role,
            ...(role === Role.BasicConsumer ? { consumerId: userId } : { brandUserId: userId })
        }
    };

    const tokenData = await prisma.token.findFirst({
        where: fields.where
    });

    if (!tokenData) {
        throw new Error('Token not found');
    }

    return tokenData;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<AuthTokensResponse>}
 */
const generateAuthTokens = async (user: { id: string }, role: Role): Promise<AuthTokensResponse> => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user.id, accessTokenExpires, TokenType.ACCESS, config.jwt.secret, role);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, TokenType.REFRESH, config.jwt.secret, role);
    await saveToken(refreshToken, user.id, refreshTokenExpires, TokenType.REFRESH, false, role);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate()
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate()
        }
    };
};

// /**
//  * Generate reset password token
//  * @param {string} email
//  * @returns {Promise<string>}
//  */
// const generateResetPasswordToken = async (email: string): Promise<string> => {
//   const user = await userService.getUserByEmail(email);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
//   }
//   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
//   await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
//   return resetPasswordToken;
// };

// /**
//  * Generate verify email token
//  * @param {User} user
//  * @returns {Promise<string>}
//  */
// const generateVerifyEmailToken = async (user: { id: number }): Promise<string> => {
//   const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
//   const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
//   await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
//   return verifyEmailToken;
// };

export default {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
};
