// /* eslint-disable prettier/prettier */
// // import { Role } from '@prisma/client';
// import Joi from 'joi';
// import { password } from './custom.validation';

// const verifyWallet1 = {
//     body: Joi.object().keys({
//         walletAddress: Joi.string().required()
//     })
// };

// const verifyWallet2 = {
//     body: Joi.object().keys({
//         walletAddress: Joi.string().required(),
//         signature: Joi.string().required(),
//         words: Joi.string().required(),
//         name: Joi.string(),
//         email: Joi.string().email(),
//         description: Joi.string()
//     })
// };

// const findPoints = {
//     params: Joi.object().keys({
//         customerId: Joi.string().required()
//     }),
// };

// const redeem = {
//     params: Joi.object().keys({
//         customerId: Joi.string().required()
//     }),
//     body: Joi.object().keys({
//         companyId: Joi.string().required(),
//         amount: Joi.number().required(),
//     })
// };

// const findOnChainPointsInAContract = {
//     params: Joi.object().keys({
//         customerId: Joi.string().required(),
//         pointId: Joi.string().required()
//     })
// };

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     findPoints,
//     redeem,
//     findOnChainPointsInAContract
// };
