// /* eslint-disable prettier/prettier */
// import { User, Role, Prisma, company, customer, customer_points, point_contract } from '@prisma/client';
// import httpStatus from 'http-status';
// import prisma from '../client';
// import ApiError from '../utils/ApiError';
// import { encryptPassword } from '../utils/encryption';
// import { getOnChainPointsForUser, getPointsDataOnChainForUserInAContract } from '../utils/contract-helper';
// import { generateSignaturePointsRedemption, getPointsInWei } from '../utils/web3-utils';

// type CustomerPointsWithCompany = (customer_points & {
//     company: {
//         id: string; name: string; point_name: string; point_contract_address: string | null; point_symbol: string; decimal: number;
//     };
// });

// /**
//  * Create a company
//  * @param {Object} companyBody
//  * @returns {Promise<User>}
//  */
// const createCustomer = async (
//     name: string,
//     description: string,
//     userId: string
// ): Promise<customer> => {
//     return await prisma.customer.create({
//         data: {
//             name: name,
//             description: description,
//             userId: userId
//         }
//     });
// };

// const getCustomerByUserId = async <Key extends keyof customer>(
//     id: string,
//     keys: Key[] = [
//         'id',
//         'created_at',
//         'updated_at',
//         'name',
//         'description',
//     ] as Key[]
// ): Promise<Pick<customer, Key> | null> => {
//     return await prisma.customer.findFirst({
//         where: { userId: id },
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     }) as Promise<Pick<customer, Key> | null>;
// };

// const getCustomerById = async <Key extends keyof customer>(
//     id: string,
//     keys: Key[] = [
//         'id',
//         'created_at',
//         'updated_at',
//         'name',
//         'description',
//         'userId'
//     ] as Key[]
// ): Promise<Pick<customer, Key> | null> => {
//     return await prisma.customer.findFirst({
//         where: { id: id },
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     }) as Promise<Pick<customer, Key> | null>;
// };

// const getCustomerPointsByWalletAddress = async (
//     walletAddress: string
// ): Promise<CustomerPointsWithCompany[] | null> => {
//     return await prisma.customer_points.findMany({
//         where: { wallet_address: walletAddress },
//         include: {
//             company: {
//                 select: {
//                     id: true,
//                     name: true,
//                     point_name: true,
//                     point_contract_address: true,
//                     point_symbol: true,
//                     decimal: true
//                 }
//             }
//         }
//     });
// };

// const getCustomerPointsByPointAndWalletAddress = async (
//     point: string,
//     walletAddress: string
// ): Promise<CustomerPointsWithCompany | null> => {
//     return await prisma.customer_points.findFirst({
//         where: { wallet_address: walletAddress, company: { point_contract_address: point } },
//         include: {
//             company: {
//                 select: {
//                     id: true,
//                     name: true,
//                     point_name: true,
//                     point_contract_address: true,
//                     point_symbol: true,
//                     decimal: true
//                 }
//             }
//         }
//     });
// };

// type RedeemResponse = {
//     canRedeem: boolean,
//     onchainPoints: number,
//     signature: string,
//     offChainPoints: number,
//     amount: number
// };

// const canRedeemPoints = async (
//     walletAddress: string,
//     companyId: string,
//     amount: number
// ): Promise<RedeemResponse> => {
//     const customerPointsInACompany = await prisma.customer_points.findFirst({
//         where: { wallet_address: walletAddress, company_id: companyId },
//         include: {
//             company: {
//                 select: {
//                     point_contract_address: true,
//                     decimal: true
//                 }
//             }
//         }
//     });

//     if (!customerPointsInACompany) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'Points not found');
//     }

//     if (!customerPointsInACompany.company || !customerPointsInACompany.company.point_contract_address) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'Company doesnt exist');
//     }

//     const pointsInSmartContract = await getPointsDataOnChainForUserInAContract(walletAddress, customerPointsInACompany.company.point_contract_address);
//     const onchainPoints = await getOnChainPointsForUser(customerPointsInACompany.company.point_contract_address, walletAddress);

//     if ((amount + onchainPoints) <= customerPointsInACompany.points) {
//         // add logic for marketplace points
//         const sig = generateSignaturePointsRedemption(walletAddress, pointsInSmartContract.decimals, Number(getPointsInWei(amount, pointsInSmartContract.decimals)), pointsInSmartContract.userNonce, customerPointsInACompany.company.point_contract_address);

//         return {
//             canRedeem: true,
//             onchainPoints: onchainPoints,
//             signature: sig.signature,
//             offChainPoints: customerPointsInACompany.points,
//             amount: Number(getPointsInWei(amount, pointsInSmartContract.decimals))
//         };
//     }

//     return {
//         canRedeem: false,
//         onchainPoints: onchainPoints,
//         signature: "",
//         offChainPoints: customerPointsInACompany.points,
//         amount: 0
//     };
// };

// const updatePoints = async (
//     id: string,
//     mintedPoints: BigInt,
//     onchainBalance: BigInt
// ): Promise<customer_points | null> => {
//     return await prisma.customer_points.update({
//         data: {
//             minted_points: mintedPoints as bigint,
//             onchain_points: onchainBalance as bigint
//         },
//         where: { id: id }
//     });
// };

// const getCustomerPoints = async (): Promise<customer_points[] | null> => {
//     return await prisma.customer_points.findMany({
//         include: {
//             company: {
//                 select: {
//                     point_contract_address: true
//                 }
//             }
//         }
//     });
// };

// const updateMintedPoints = async (
//     point_contract: string,
//     wallet: string,
//     mintedPoints: BigInt
// ): Promise<customer_points | null> => {
//     const c = await prisma.customer_points.findFirst({
//         where: {
//             company: {
//                 point_contract_address: point_contract
//             },
//             wallet_address: wallet
//         }
//     });

//     if (!c) {
//         return null;
//     }

//     const newMintedPoints = mintedPoints as bigint + c.minted_points;
//     return await prisma.customer_points.update({
//         data: {
//             minted_points: newMintedPoints as bigint,
//         },
//         where: { id: c.id }
//     });
// };

// export default {
//     createCustomer,
//     getCustomerByUserId,
//     getCustomerById,
//     getCustomerPointsByWalletAddress,
//     canRedeemPoints,
//     updatePoints,
//     updateMintedPoints,
//     getCustomerPointsByPointAndWalletAddress,
//     getCustomerPoints
// };
