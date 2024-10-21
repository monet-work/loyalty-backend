import prisma from '../client';
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import config from './config';
import { TokenType } from '@prisma/client';
import { TOKEN_EXPIRED_MESSAGE } from './constants';

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify: VerifyCallback = async (payload, done) => {
    try {
        console.log("VerifyCallback step 1: Consumer");
        // Token is valid, pass the user payload to the request
        if (payload.type !== TokenType.ACCESS) {
            throw new Error('Invalid token type');
        }

        const user = await prisma.consumer.findUnique({
            include: {
                userRole: true
            },
            where: { id: payload.sub }
        });

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

const jwtBrandVerify: VerifyCallback = async (payload, done) => {
    try {
        console.log("VerifyCallback step 1");
        // Token is valid, pass the user payload to the request
        if (payload.type !== TokenType.ACCESS) {
            throw new Error('Invalid token type');
        }

        console.log(payload.sub);
        const user = await prisma.brandUser.findUnique({
            include: {
                userRole: true,
                brand: true
            },
            where: { id: payload.sub }
        });

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
export const jwtBrandStrategy = new JwtStrategy(jwtOptions, jwtBrandVerify);
