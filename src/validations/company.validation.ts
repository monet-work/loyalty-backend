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
//         email: Joi.string().email(),
//         decimal: Joi.number(),
//         pointName: Joi.string(),
//         pointSymbol: Joi.string(),
//         name: Joi.string(),
//         description: Joi.string()
//     })
// };

// const customerPointData = Joi.object({
//     walletAddress: Joi.string().required(),
//     points: Joi.number().required(),
//     name: Joi.string().required(),
// });

// // Create an array schema for services
// const customerPointsData = Joi.array().items(customerPointData);

// const uploadPoints = {
//     params: Joi.object().keys({
//         companyId: Joi.string().required()
//     }),
//     body: Joi.object().keys({
//         customerPoints: customerPointsData
//     })
// };

// const deletePoint = {
//     params: Joi.object().keys({
//         companyId: Joi.string().required(),
//         pointId: Joi.string().required()
//     })
// };

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     uploadPoints,
//     deletePoint
// };
