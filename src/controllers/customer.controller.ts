// /* eslint-disable prettier/prettier */
// import httpStatus from 'http-status';
// import pick from '../utils/pick';
// import ApiError from '../utils/ApiError';
// import catchAsync from '../utils/catchAsync';
// import { customerService, tokenService, userService } from '../services';
// import { generate } from '../utils/GenerateWords';
// import { verifyEOASignature } from 'thirdweb/auth';
// import { Role, User, company } from '@prisma/client';
// import { getOnChainPointsForUser } from '../utils/contract-helper';
// import { getPointsInEther2 } from '../utils/web3-utils';

// const verifyWallet1 = catchAsync(async (req, res) => {
//     const { walletAddress } = req.body;
//     const words = generate({ exactly: 3, join: " " });
//     const user = await userService.getUserByWalletAddress(walletAddress);

//     let isRegistered = true;
//     if (!user) {
//         isRegistered = false;
//     } else {
//         const customer = await customerService.getCustomerByUserId(user.id);
//         if (!customer) {
//             isRegistered = false;
//         }
//     }

//     res.status(httpStatus.OK).send({
//         words: words,
//         isRegistered: isRegistered
//     });
// });

// const verifyWallet2 = catchAsync(async (req, res) => {
//     const { walletAddress, signature, words, email, name, description } = req.body;

//     // validate signature
//     const isSignatureValid = await verifyEOASignature({
//         address: walletAddress,
//         signature,
//         message: words,
//     });

//     if (!isSignatureValid) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Signature verification failed"
//         });
//         return;
//     }

//     let user = await userService.getUserByWalletAddress(walletAddress),
//         customer;

//     if (!user) {
//         // email: Joi.string().email(),
//         // pointName: Joi.string().required(),
//         // pointSymbol: Joi.string().required(),
//         // name: Joi.string().required().min(1).max(100),
//         if (!email || !name) {
//             res.status(httpStatus.BAD_REQUEST).send({
//                 message: "Invalid input"
//             });
//             return;
//         }
//         // create user and create company
//         user = await userService.createUser(walletAddress, email, Role.CUSTOMER);

//         if (!user) {
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 message: "Failed to create user"
//             });
//             return;
//         }


//         customer = await customerService.createCustomer(name, description, user.id);

//         if (!customer) {
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 message: "Failed to create customer"
//             });
//             return;
//         }
//     } else {
//         customer = await customerService.getCustomerByUserId(user.id);
//         if (!customer) {
//             if (!email || !name) {
//                 res.status(httpStatus.BAD_REQUEST).send({
//                     message: "Invalid input"
//                 });
//                 return;
//             }

//             customer = await customerService.createCustomer(name, description, user.id);

//             if (!customer) {
//                 res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                     message: "Failed to create customer"
//                 });
//                 return;
//             }
//         }

//         // create role for company if it doesn't exist already
//         await userService.createRoleForUser(user.id, Role.CUSTOMER);
//     }


//     const tokens = await tokenService.generateAuthTokens(user);

//     res.status(httpStatus.OK).send({
//         customer: customer,
//         tokens
//     });
// });

// const findPoints = catchAsync(async (req, res) => {
//     const customerId = req.params.customerId;
//     const authUser = req.user as User & { customer: { id: string } };

//     if (authUser && authUser.customer && customerId !== authUser.customer.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Unauthorized request"
//         });
//         return;
//     }

//     const points = await customerService.getCustomerPointsByWalletAddress(authUser.wallet_address);

//     if (!points) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Points not found"
//         });
//         return;
//     }

//     points.forEach((point: any) => {
//         point.minted_points = getPointsInEther2(String(point.minted_points), point.company.decimal);
//         // point.points = getPointsInEther2(String(point.minted_points), point.company.decimal);
//         point.onchain_points = getPointsInEther2(String(point.onchain_points), point.company.decimal);
//     });

//     res.status(httpStatus.OK).send({
//         points
//     });
// });

// const findOnPointsForAUserInAPointContract = catchAsync(async (req, res) => {
//     const customerId = req.params.customerId,
//         pointId = req.params.pointId;
//     const authUser = req.user as User & { customer: { id: string } };

//     if (authUser && authUser.customer && customerId !== authUser.customer.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Unauthorized request"
//         });
//         return;
//     }

//     const points = await getOnChainPointsForUser(pointId, authUser.wallet_address);

//     // if (!points) {
//     //     res.status(httpStatus.NOT_FOUND).send({
//     //         message: "Points not found"
//     //     });
//     //     return;
//     // }

//     res.status(httpStatus.OK).send({
//         points
//     });
// });

// const redeem = catchAsync(async (req, res) => {
//     const customerId = req.params.customerId;
//     const authUser = req.user as User & { customer: { id: string } };

//     const { companyId, amount } = req.body;

//     if (authUser && authUser.customer && customerId !== authUser.customer.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Unauthorized request"
//         });
//         return;
//     }

//     const redeemResponse = await customerService.canRedeemPoints(authUser.wallet_address, companyId, amount);

//     if (!redeemResponse.canRedeem) {
//         res.status(httpStatus.NOT_ACCEPTABLE).send({
//             message: "Not valid request to redeem points",
//             data: redeemResponse
//         });
//         return;
//     }

//     // generate a signature to mint the points

//     res.status(httpStatus.OK).send({
//         data: redeemResponse
//     });
// });

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     findPoints,
//     redeem,
//     findOnPointsForAUserInAPointContract
// };
