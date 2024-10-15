/* eslint-disable prettier/prettier */

import Joi from 'joi';
import { OTP_LENGTH, REG_CODE_LENGTH } from '../config/constants';

const signUp = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        regCode: Joi.string().length(REG_CODE_LENGTH).required()
    })
};

const verifyOTP = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(OTP_LENGTH).required(),
        regCode: Joi.string().length(REG_CODE_LENGTH).required(),
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
        otp: Joi.string().length(6).required()
    })
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required()
    })
};

export default {
    verifyOTP,
    signUp,
    login,
    loginVerifyOTP,
    logout
};
