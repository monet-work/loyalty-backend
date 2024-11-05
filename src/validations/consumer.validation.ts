/* eslint-disable prettier/prettier */

import Joi from 'joi';
import { OTP_LENGTH } from '../config/constants';

const signUp = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required()
    })
};

const verifyOTP = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(OTP_LENGTH).required()
    })
};

const login = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required()
    })
};

const loginVerifyOTP = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(OTP_LENGTH).required()
    })
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required()
    })
};

const updateProfile = {
    body: Joi.object().keys({
        name: Joi.string().min(1).max(50).required(),
        description: Joi.string().min(0).max(500)
    })
}

const linkBrandProfile = {
    body: Joi.object().keys({
        brandId: Joi.string().required(),
        email: Joi.string().email(),
        countryCode: Joi.string(),
        mobileNumber: Joi.string(),
    })
        .xor('email', 'mobileNumber') // Only one of these options is allowed
        .and('countryCode', 'mobileNumber') // If one is present, the other must also be present
        .messages({
            'object.missing': 'Either email or both country code and mobile number are required.',
            'object.and': 'Both country code and mobile number must be provided together.',
            'object.xor': 'Provide either email or (country code + mobile number), not both.',
        })
}

const verifyBrandProfileRequest = {
    body: Joi.object().keys({
        id: Joi.string().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(OTP_LENGTH).required()
    })
}

const transferPoints = {
    body: Joi.object().keys({
        fromBrandId: Joi.string().required(),
        toBrandId: Joi.string().required(),
        points: Joi.number().required()
    })
};

const brandAccounts = {}

export default {
    verifyOTP,
    signUp,
    login,
    loginVerifyOTP,
    logout,
    updateProfile,
    linkBrandProfile,
    verifyBrandProfileRequest,
    transferPoints,
    brandAccounts
};
