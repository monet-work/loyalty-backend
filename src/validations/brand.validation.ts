/* eslint-disable prettier/prettier */

import Joi from 'joi';
import { OTP_LENGTH, REG_CODE_LENGTH } from '../config/constants';
import { industriesWithCategories } from '../config/brand-categories';

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

const updateProfile = {
    body: Joi.object().keys({
        name: Joi.string().min(1).max(50).required(),
        description: Joi.string().min(0).max(500)
    })
};

const addPOCRequest = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
    })
};

const verifyPOCRequest = {
    body: Joi.object().keys({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(6).required()
    })
};

const sendEmailRequest = {
    body: Joi.object().keys({
        email: Joi.string().email().required()
    })
};

const verifyEmailRequest = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        requestId: Joi.string().required(),
        otp: Joi.string().length(6).required()
    })
};

const updateBusinessInfo = {
    body: Joi.object({
        industry: Joi.string()
            .valid(...Object.keys(industriesWithCategories))
            .required()
            .messages({
                'any.only': 'Invalid industry. Please select a valid industry.',
                'any.required': 'Industry is required.',
            }),
        category: Joi.string()
            .required()
            .custom((value, helpers) => {
                const { industry } = helpers.state.ancestors[0]; // Access industry from request data
                const validCategories = (industriesWithCategories as any)[industry];
                if (!validCategories || !validCategories.includes(value)) {
                    return helpers.error('any.invalid', { value });
                }
                return value;
            })
            .messages({
                'any.invalid': 'Invalid category for the selected industry.',
                'any.required': 'Category is required.',
            }),
        conversionRate: Joi.number().required(),
        brandSymbol: Joi.string()
    })
};

const findTransactions = {
    params: Joi.object().keys({
        brandId: Joi.string().required()
    })
};

const findTransaction = {
    params: Joi.object().keys({
        brandId: Joi.string().required(),
        transactionId: Joi.string().required()
    })
};

export default {
    verifyOTP,
    signUp,
    login,
    loginVerifyOTP,
    logout,
    updateProfile,
    addPOCRequest,
    verifyPOCRequest,
    sendEmailRequest,
    verifyEmailRequest,
    updateBusinessInfo,
    findTransactions,
    findTransaction
};
