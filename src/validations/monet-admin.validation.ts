// /* eslint-disable prettier/prettier */
// // import { Role } from '@prisma/client';
// import Joi from 'joi';

// const verifyWallet1 = {
//     body: Joi.object().keys({
//         walletAddress: Joi.string().required(),
//     })
// };

// const verifyWallet2 = {
//     body: Joi.object().keys({
//         walletAddress: Joi.string().required(),
//         signature: Joi.string().required(),
//         words: Joi.string().required()
//     })
// };

// const approveCompany = {
//     params: Joi.object().keys({
//         companyId: Joi.string().required()
//     }),
//     body: Joi.object().keys({
//         approve: Joi.boolean().required(),
//     })
// };

// const pointAssetInfo = {
//     params: Joi.object().keys({
//         pointAddress: Joi.string().required(),
//     })
// };

// const syncCustomerPoints = {
//     body: Joi.object().keys({
//         walletAddress: Joi.string().required(),
//     })
// };

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     approveCompany,
//     pointAssetInfo,
//     syncCustomerPoints
// };
