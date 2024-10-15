// /* eslint-disable prettier/prettier */
// import httpStatus from 'http-status';
// import pick from '../utils/pick';
// import ApiError from '../utils/ApiError';
// import catchAsync from '../utils/catchAsync';
// import { companyService, tokenService, userService } from '../services';
// import { generate } from '../utils/GenerateWords';
// import { verifyEOASignature } from 'thirdweb/auth';
// import { Role, User, company } from '@prisma/client';

// const verifyWallet1 = catchAsync(async (req, res) => {
//     const { walletAddress } = req.body;
//     const words = generate({ exactly: 3, join: " " });
//     // const company = await companyService.getCompany(walletAddress);
//     const user = await userService.getUserByWalletAddress(walletAddress);

//     let isRegistered = true;
//     if (!user) {
//         isRegistered = false;
//     } else {
//         const company = await companyService.getCompanyByUserId(user.id);

//         if (!company) {
//             isRegistered = false;
//         }
//     }

//     res.status(httpStatus.OK).send({
//         words: words,
//         isRegistered: isRegistered
//     });
// });

// const verifyWallet2 = catchAsync(async (req, res) => {
//     const { walletAddress, signature, words, email, decimal, pointName, pointSymbol, name, description } = req.body;

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
//         company;

//     if (!user) {
//         // email: Joi.string().email(),
//         // pointName: Joi.string().required(),
//         // pointSymbol: Joi.string().required(),
//         // name: Joi.string().required().min(1).max(100),
//         if (!email || !pointName || !pointSymbol || !name || !decimal) {
//             res.status(httpStatus.BAD_REQUEST).send({
//                 message: "Invalid input"
//             });
//             return;
//         }
//         // create user and create company
//         user = await userService.createUser(walletAddress, email, Role.COMPANY);

//         if (!user) {
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 message: "Failed to create user"
//             });
//             return;
//         }


//         company = await companyService.createCompany(name, description, pointName, pointSymbol, user.id, decimal);

//         if (!company) {
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                 message: "Failed to create company"
//             });
//             return;
//         }
//     } else {
//         company = await companyService.getCompanyByUserId(user.id);
//         if (!company) {
//             if (!email || !pointName || !pointSymbol || !name || !decimal) {
//                 res.status(httpStatus.BAD_REQUEST).send({
//                     message: "Invalid input"
//                 });
//                 return;
//             }

//             company = await companyService.createCompany(name, description, pointName, pointSymbol, user.id, decimal);

//             if (!company) {
//                 res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//                     message: "Failed to create company"
//                 });
//                 return;
//             }
//         }

//         // create role for company if it doesn't exist already
//         await userService.createRoleForUser(user.id, Role.COMPANY);
//     }


//     const tokens = await tokenService.generateAuthTokens(user);

//     res.status(httpStatus.OK).send({
//         company: company,
//         tokens
//     });
// });

// const uploadPoints = catchAsync(async (req, res) => {
//     const companyId = req.params.companyId;
//     const { customerPoints } = req.body;

//     const authUser = req.user as User;

//     const company = await companyService.getCompanyByUserId(authUser.id);

//     if (!company) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Company not found",
//         });
//         return;
//     }

//     if (companyId !== company.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Company not authorized",
//         });
//         return;
//     }

//     if (!company.is_approved || !company.point_contract_address) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Not approved yet or Point Contract Address not deployed",
//         });
//         return;
//     }

//     const customerPointsData = await companyService.createCustomerPoints(companyId, customerPoints);

//     if (!customerPointsData) {
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//             message: "Failed to upload customer points",
//         });
//         return;
//     }

//     res.status(httpStatus.CREATED).send({
//         customerPoints: customerPointsData
//     });
// });

// const deletePoint = catchAsync(async (req, res) => {
//     const companyId = req.params.companyId;
//     const pointId = req.params.pointId;

//     const authUser = req.user as User;

//     const company = await companyService.getCompanyByUserId(authUser.id);

//     if (!company) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Company not found",
//         });
//         return;
//     }

//     if (companyId !== company.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Company not authorized",
//         });
//         return;
//     }

//     if (!company.is_approved || !company.point_contract_address) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Not approved yet or Point Contract Address not deployed",
//         });
//         return;
//     }

//     const customerPoints = await companyService.deletePoint(companyId, pointId);

//     if (!customerPoints) {
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//             message: "Failed to delete customer points",
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         customerPoints: customerPoints
//     });
// });

// const getCompanyDashboard = catchAsync(async (req, res) => {
//     const companyId = req.params.companyId;

//     const authUser = req.user as User;

//     const company = await companyService.getCompanyByUserId(authUser.id);

//     if (!company) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Company not found",
//         });
//         return;
//     }

//     if (companyId !== company.id) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Company not authorized",
//         });
//         return;
//     }

//     if (!company.is_approved || !company.point_contract_address) {
//         res.status(httpStatus.NO_CONTENT).send({
//             message: "Company not approved yet",
//             company: company
//         });
//         return;
//     }

//     const companyDashboardData = await companyService.getCustomerPoints(companyId);

//     if (!companyDashboardData) {
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//             message: "Failed to get company dashboard data",
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         dashboard: companyDashboardData,
//         company: company
//     });
// });

// // const deleteUser = catchAsync(async (req, res) => {
// //     await userService.deleteUserById(req.params.userId);
// //     res.status(httpStatus.NO_CONTENT).send();
// // });

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     uploadPoints,
//     getCompanyDashboard,
//     deletePoint
// };
