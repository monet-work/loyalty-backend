// /* eslint-disable prettier/prettier */
// import { User, Role, Prisma, company, customer, role, point_contract, listings } from '@prisma/client';
// import httpStatus from 'http-status';
// import prisma from '../client';
// import ApiError from '../utils/ApiError';
// import { encryptPassword } from '../utils/encryption';
// import { deployPointsContract, getListingCount, getListings, getOwner } from '../utils/contract-helper';

// const savePointAddressForMarketPlace = async (
//     owner: string,
//     pointAddress: string,
//     name: string,
//     symbol: string,
//     status: number
// ): Promise<point_contract> => {
//     return await prisma.point_contract.create({
//         data: {
//             owner: owner,
//             pointAddress: pointAddress,
//             name: name,
//             symbol: symbol,
//             status: status
//         }
//     });
// };

// const setAssetStatus = async (
//     asset: string,
//     status: number
// ): Promise<void> => {
//     await prisma.point_contract.update({
//         data: {
//             status: status
//         },
//         where: {
//             pointAddress: asset
//         }
//     });
// };

// const getAssetAddresses = async (): Promise<point_contract[]> => {
//     return await prisma.point_contract.findMany();
// };

// const findAssetListings = async (asset: string): Promise<listings[]> => {
//     return await prisma.listings.findMany({
//         where: {
//             asset: asset
//         }
//     });
// };

// const updateOrInsertAsset = async (asset: { name: string, symbol: string, address: string, status: number }): Promise<void> => {
//     try {
//         const pointAsset = await prisma.point_contract.findFirst({
//             where: { pointAddress: asset.address }
//         });

//         const owner = await getOwner(asset.address);

//         if (!pointAsset) {
//             await savePointAddressForMarketPlace(owner, asset.address, asset.name, asset.symbol, asset.status);
//         } else {
//             if (pointAsset.status === asset.status &&
//                 pointAsset.owner === owner &&
//                 pointAsset.name === asset.name &&
//                 pointAsset.symbol === asset.symbol) {
//                 return;
//             }

//             await prisma.point_contract.update({
//                 data: {
//                     status: asset.status,
//                     owner: owner,
//                     name: asset.name,
//                     symbol: asset.symbol
//                 },
//                 where: {
//                     pointAddress: asset.address
//                 }
//             });
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// const saveListing = async (listingData: listings): Promise<void> => {
//     const l = await prisma.listings.findFirst({
//         where: {
//             Id: listingData.Id
//         }
//     });

//     if (!l) {
//         await prisma.listings.create({
//             data: {
//                 Id: listingData.Id,
//                 amount: listingData.amount,
//                 pricePerPoint: listingData.pricePerPoint,
//                 // totalPrice: listingData.totalPrice,
//                 owner: listingData.owner,
//                 asset: listingData.asset,
//                 paymentToken: listingData.paymentToken,
//                 listingType: listingData.listingType,
//                 paymentType: listingData.paymentType,
//                 fillType: listingData.fillType,
//                 status: listingData.status
//             }
//         });
//     } else {
//         await prisma.listings.update({
//             data: {
//                 Id: listingData.Id,
//                 amount: listingData.amount,
//                 pricePerPoint: listingData.pricePerPoint,
//                 // totalPrice: listingData.totalPrice,
//                 owner: listingData.owner,
//                 asset: listingData.asset,
//                 paymentToken: listingData.paymentToken,
//                 listingType: listingData.listingType,
//                 paymentType: listingData.paymentType,
//                 fillType: listingData.fillType,
//                 status: listingData.status
//             },
//             where: {
//                 Id: listingData.Id
//             }
//         });
//     }

// }

// const updateOrInsertListing = async (listingData: listings): Promise<void> => {
//     try {
//         const listing = await prisma.listings.findFirst({
//             where: { Id: listingData.Id }
//         });

//         if (!listing) {
//             await prisma.listings.create({
//                 data: {
//                     Id: listingData.Id,
//                     amount: listingData.amount,
//                     pricePerPoint: listingData.pricePerPoint,
//                     // totalPrice: listingData.totalPrice,
//                     owner: listingData.owner,
//                     asset: listingData.asset,
//                     paymentToken: listingData.paymentToken,
//                     listingType: listingData.listingType,
//                     paymentType: listingData.paymentType,
//                     fillType: listingData.fillType,
//                     status: listingData.status
//                 }
//             });
//         } else {
//             if (listingData.Id === listing.Id &&
//                 listingData.amount === listing.amount &&
//                 listingData.pricePerPoint === listing.pricePerPoint &&
//                 // listingData.totalPrice === listing.totalPrice &&
//                 listingData.owner === listing.owner &&
//                 listingData.asset === listing.asset &&
//                 listingData.paymentToken === listing.paymentToken &&
//                 listingData.listingType === listing.listingType &&
//                 listingData.paymentType === listing.paymentType &&
//                 listingData.fillType === listing.fillType &&
//                 listingData.status === listing.status) {
//                 return;
//             }

//             await prisma.listings.update({
//                 data: {
//                     Id: listingData.Id,
//                     amount: listingData.amount,
//                     pricePerPoint: listingData.pricePerPoint,
//                     // totalPrice: listingData.totalPrice,
//                     owner: listingData.owner,
//                     asset: listingData.asset,
//                     paymentToken: listingData.paymentToken,
//                     listingType: listingData.listingType,
//                     paymentType: listingData.paymentType,
//                     fillType: listingData.fillType,
//                     status: listingData.status
//                 },
//                 where: {
//                     id: listing.id
//                 }
//             });
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// export default {
//     savePointAddressForMarketPlace,
//     setAssetStatus,
//     getAssetAddresses,
//     updateOrInsertAsset,
//     updateOrInsertListing,
//     findAssetListings,
//     saveListing
// };
