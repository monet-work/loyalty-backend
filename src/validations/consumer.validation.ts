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

export default {
    verifyOTP,
    signUp,
    login,
    loginVerifyOTP,
    logout,
    updateProfile
};
