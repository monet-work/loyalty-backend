// /* eslint-disable prettier/prettier */
// import httpStatus from 'http-status';
// import pick from '../utils/pick';
// import ApiError from '../utils/ApiError';
// import catchAsync from '../utils/catchAsync';
// import { companyService, contractService, customerService, tokenService, userService } from '../services';
// import { generate } from '../utils/GenerateWords';
// import { verifyEOASignature } from 'thirdweb/auth';
// import { Role, User, company } from '@prisma/client';
// import monetAdminService from '../services/monet-admin.service';
// import { getAssetAddresses, getAssetInfo, getListingCount, getListings, getMintedPointsForUser, getOnChainBalanceForUser, getOnChainPointsForUser, getPointsDataOnChainForUserInAContract } from '../utils/contract-helper';
// // import { d } from '../utils/contract-helper';
// import { getPointsInEther, getPointsInEther2 } from '../utils/web3-utils';

// const verifyWallet1 = catchAsync(async (req, res) => {
//     const { walletAddress } = req.body;
//     const words = generate({ exactly: 3, join: " " });
//     const user = await userService.getUserByWalletAddress(walletAddress);

//     if (!user) {
//         res.status(httpStatus.UNAUTHORIZED).send({
//             message: "Admin wallet not found"
//         });
//         return;
//     } else {
//         const roles = await userService.findRolesForUser(user.id);

//         const adminRole = roles.filter(_role => _role.role === Role.ADMIN);

//         if (adminRole.length <= 0) {
//             res.status(httpStatus.UNAUTHORIZED).send({
//                 message: "Admin role not found"
//             });
//             return;
//         }
//     }

//     res.status(httpStatus.OK).send({
//         words: words
//     });
// });

// const verifyWallet2 = catchAsync(async (req, res) => {
//     const { walletAddress, signature, words } = req.body;

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

//     const admin = await monetAdminService.getAdminByWalletAddress(walletAddress);

//     if (!admin) {
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//             message: "Failed to find admin"
//         });
//         return;
//     }

//     const tokens = await tokenService.generateAuthTokens(admin);

//     res.status(httpStatus.OK).send({
//         admin: admin,
//         tokens
//     });
// });

// const approveCompany = catchAsync(async (req, res) => {
//     const { companyId } = req.params;
//     const { approve } = req.body;

//     const company = await monetAdminService.approveCompany(companyId, approve);

//     if (!company) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Failed to approve company"
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         company: company
//     });
// });

// const findCompanies = catchAsync(async (req, res) => {
//     // const data = await d();
//     // console.log(data);
//     const companies = await monetAdminService.findCompanies();

//     if (!companies) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Failed to find companies"
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         companies: companies
//     });
// });

// const findCustomers = catchAsync(async (req, res) => {
//     // const data = await d();
//     // console.log(data);
//     const customers = await monetAdminService.findCustomers();

//     if (!customers) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Failed to find customers"
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         customers: customers
//     });
// });

// const findRewardPointAssets = catchAsync(async (req, res) => {
//     const authUser = req.user as User;
//     const pointsAssets = await contractService.getAssetAddresses();
//     const customerAssetsMap = new Map();
//     try {
//         const customerAssets = await customerService.getCustomerPointsByWalletAddress(authUser.wallet_address);

//         if (customerAssets) {
//             for (const asset of customerAssets) {
//                 customerAssetsMap.set(asset.company.point_contract_address, {
//                     minted_points: asset.minted_points,
//                     onchain_points: asset.onchain_points,
//                     decimal: asset.company.decimal
//                 });
//             }
//         }

//     } catch (err) {
//         console.log(err);
//     }


//     if (!pointsAssets) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Failed to find assets in market place"
//         });
//         return;
//     }

//     pointsAssets.forEach((p: any) => {
//         if (customerAssetsMap.get(p.pointAddress)) {
//             p.mintedPoints = getPointsInEther2(customerAssetsMap.get(p.pointAddress).minted_points, customerAssetsMap.get(p.pointAddress).decimal);
//             p.userPoints = getPointsInEther2(customerAssetsMap.get(p.pointAddress).onchain_points, customerAssetsMap.get(p.pointAddress).decimal);
//         } else {
//             p.mintedPoints = "0";
//             p.userPoints = "0";
//         }
//         p.address = p.pointAddress;
//     });

//     res.status(httpStatus.OK).send({
//         pointsAssets
//     });
// });

// const syncPoints = catchAsync(async (req, res) => {
//     const pointsAssets = await getAssetAddresses();
//     // console.log(poin)

//     for (const asset of pointsAssets) {
//         // console.log(asset);
//         await contractService.updateOrInsertAsset(asset);
//     }

//     res.status(httpStatus.OK).send({
//         message: "Point assets are in sync now :)"
//     });
// });

// // eslint-disable-next-line @typescript-eslint/no-redeclare
// interface BigInt {
//     /** Convert to BigInt to string form in JSON.stringify */
//     toJSON: () => string;
// }

// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore: Unreachable code error
// BigInt.prototype.toJSON = function (): string {
//     return this.toString();
// };

// const findRewardPointAssetInfo = catchAsync(async (req, res) => {
//     const authUser = req.user as User;
//     const { pointAddress } = req.params;
//     const walletAddress = authUser.wallet_address;

//     // const pointsData = await getPointsDataOnChainForUserInAContract(walletAddress, pointAddress);

//     const pointAssetInfo = await contractService.findAssetListings(pointAddress);

//     if (!pointAssetInfo) {
//         res.status(httpStatus.NOT_FOUND).send({
//             message: "Failed to find listings for the asset"
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send({
//         listings: {
//             assetListings: pointAssetInfo
//         }
//     });
// });

// const syncListings = catchAsync(async (req, res) => {
//     const listingCount = await getListingCount();

//     const listings = await getListings(listingCount, { all: true });

//     for (const listing of listings.listings) {
//         // console.log(asset);
//         await contractService.updateOrInsertListing(listing);
//     }

//     res.status(httpStatus.OK).send({
//         message: "Listings are in sync now :)"
//     });
// });

// const syncCustomerPoints = catchAsync(async (req, res) => {
//     const { walletAddress } = req.body;
//     const customerAssets = await customerService.getCustomerPointsByWalletAddress(walletAddress);

//     if (!customerAssets) {
//         res.status(httpStatus.OK).send({
//             message: "Customer don't have any assets :("
//         });
//         return;
//     }

//     for (const asset of customerAssets) {
//         const mintedPoints = await getMintedPointsForUser(asset.company.point_contract_address!, walletAddress);
//         const onchainBalance = await getOnChainBalanceForUser(asset.company.point_contract_address!, walletAddress);

//         await customerService.updatePoints(asset.id, mintedPoints, onchainBalance);
//     }

//     res.status(httpStatus.OK).send({
//         message: "Customer points are in sync now :)"
//     });
// });

// const findCustomerPoints = catchAsync(async (req, res) => {
//     const customerPoints = await customerService.getCustomerPoints();

//     if (!customerPoints) {
//         res.status(httpStatus.OK).send({
//             message: "Customer points do not exist"
//         });
//         return;
//     }

//     res.status(httpStatus.OK).send(customerPoints);
// });
// // const deleteUser = catchAsync(async (req, res) => {
// //     await userService.deleteUserById(req.params.userId);
// //     res.status(httpStatus.NO_CONTENT).send();
// // });

// export default {
//     verifyWallet1,
//     verifyWallet2,
//     approveCompany,
//     findCompanies,
//     findRewardPointAssets,
//     findRewardPointAssetInfo,
//     findCustomers,
//     syncPoints,
//     syncListings,
//     syncCustomerPoints,
//     findCustomerPoints
// };
