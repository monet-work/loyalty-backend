// /* eslint-disable prettier/prettier */
// // import { monetPointsFactoryContractABI } from "@/models/abi";
// import { createThirdwebClient, defineChain, getContract, getContractEvents, prepareContractCall, prepareEvent, readContract, sendTransaction, watchContractEvents } from 'thirdweb';
// import { privateKeyToAccount } from "thirdweb/wallets";
// import { baseSepolia } from 'thirdweb/chains';
// import { MONET_MARKET_PLACE_ABI, MONET_POINT_CONTRACT_ABI, MONET_POINT_FACTORY_ABI } from '../config/abi';
// import { ThirdwebSDK } from "@thirdweb-dev/sdk";
// import { MONET_MARKET_PLACE_EVENTS, MONET_POINT_CONTRACT_EVENTS, MONET_POINT_FACTORY_EVENTS } from '../config/constants';
// import { companyService, contractService, customerService } from '../services';
// import { generateSignaturePointsRedemption, getPointsInEther, getPointsInWei, redeemPoints2 } from './web3-utils';
// import { point_contract } from '@prisma/client';
// // import { PointStatus } from '@prisma/client';

// const sdk = ThirdwebSDK.fromPrivateKey(
//     process.env.WALLET_PRIVATE_KEY!,
//     Number(process.env.CHAIN_ID!),
//     {
//         secretKey: process.env.THIRDWEB_SECRET_KEY!,
//     }
// );

// const network = baseSepolia;

// const monetPointsFactoryContractAddress = process.env.MONET_POINT_FACTORY_CONTRACT || '';
// const monetMarketPlaceContractAddress = process.env.MONET_POINT_MARKETPLACE || '';

// const thirdWebClient = createThirdwebClient({
//     secretKey: process.env.THIRDWEB_SECRET_KEY!
// });

// const monetPointsFactoryContract = (getContract as any)({
//     client: thirdWebClient,
//     chain: network,
//     address: monetPointsFactoryContractAddress,
//     abi: MONET_POINT_FACTORY_ABI,
// });

// const monetMarketPlaceContract = (getContract as any)({
//     client: thirdWebClient,
//     chain: network,
//     address: monetMarketPlaceContractAddress,
//     abi: MONET_MARKET_PLACE_ABI,
// });

// export const getOwner = async (assetAddress: string): Promise<string> => {
//     const monetPointsContract = (getContract as any)({
//         client: thirdWebClient,
//         chain: network,
//         address: assetAddress,
//         abi: MONET_POINT_CONTRACT_ABI,
//     });

//     const owner = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "owner",
//     });

//     return owner;
// };

// export const getAssetAddresses = async () => {
//     console.log(`Asset Addresses`);
//     const assetAddresses: string[] = await (readContract as any)({
//         contract: monetMarketPlaceContract,
//         method: "getAssetAddresses",
//     });

//     // console.log(assetAddresses);
//     const pointAddressesInfo: { name: string, symbol: string, address: string, status: number }[] = [];

//     for (const assetAddress of assetAddresses) {
//         const monetPointsContract = (getContract as any)({
//             client: thirdWebClient,
//             chain: network,
//             address: assetAddress,
//             abi: MONET_POINT_CONTRACT_ABI,
//         });

//         const name = await (readContract as any)({
//             contract: monetPointsContract,
//             method: "name",
//         });

//         const sym = await (readContract as any)({
//             contract: monetPointsContract,
//             method: "symbol",
//         });

//         const asset = await (readContract as any)({
//             contract: monetMarketPlaceContract,
//             method: "getAsset",
//             params: [assetAddress]
//         });

//         // console.log(asset);

//         pointAddressesInfo.push({
//             "name": name,
//             "symbol": sym,
//             "address": assetAddress,
//             "status": asset.status
//         });
//     }

//     return pointAddressesInfo;
// };

// export const getAssetInfo = async (walletAddress: string, contractAddress: string) => {
//     const pointsData = await getPointsDataOnChainForUserInAContract(walletAddress, contractAddress);
//     const listingCount = await getListingCount();

//     const listings = await getListings(listingCount, {
//         asset: contractAddress,
//         ownerAndAsset: true
//     });

//     return {
//         listings: listings,
//         points: Number(pointsData.userPoints),
//         "symbol": pointsData.symbol,
//         name: pointsData.name,
//         decimals: pointsData.decimals
//     }
// };

// export const getListings = async (listingCount: number, filterConditions: { owner?: string | null, asset?: string | null, ownerAndAsset?: boolean, all?: boolean | null }) => {
//     const listings = [];
//     const ownerListings = [],
//         assetListings = [],
//         ownerAndAssetListings = [];

//     for (let i = 1; i <= listingCount; i++) {
//         const listing = await (readContract as any)({
//             contract: monetMarketPlaceContract,
//             method: "getListing",
//             params: [i]
//         });

//         if (filterConditions.ownerAndAsset) {
//             if (filterConditions.owner &&
//                 filterConditions.asset &&
//                 listing.owner === filterConditions.owner &&
//                 listing.asset === filterConditions.asset) {
//                 ownerAndAssetListings.push(listing);
//             }
//         }

//         if (filterConditions.owner && listing.owner === filterConditions.owner) {
//             ownerListings.push(listing);
//         }

//         if (filterConditions.asset && listing.asset === filterConditions.asset) {
//             assetListings.push(listing);
//         }

//         if (filterConditions.all) {
//             listings.push(listing);
//         }
//     }

//     return {
//         listings,
//         ownerListings,
//         assetListings,
//         ownerAndAssetListings
//     };
// };

// export const getListingCount = async () => {
//     console.log("Listing Count");
//     const listingCount = await (readContract as any)({
//         contract: monetMarketPlaceContract,
//         method: "getListingCount",
//     });

//     console.log(listingCount);

//     return listingCount;
// };

// export const addEventListenerToPointContract = async (asset: point_contract) => {
//     const pointContractUsingSDK = await sdk.getContract(asset.pointAddress, MONET_POINT_CONTRACT_ABI);
//     pointContractUsingSDK.events.addEventListener(MONET_POINT_CONTRACT_EVENTS.MINT, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_POINT_CONTRACT_EVENTS.MINT) {
//             const customerAsset = await customerService.getCustomerPointsByPointAndWalletAddress(event.transaction.address!, event.data.user);

//             const mintedPoints = await getMintedPointsForUser(event.transaction.address!, event.data.user);
//             const onchainBalance = await getOnChainBalanceForUser(event.transaction.address!, event.data.user);

//             await customerService.updatePoints(customerAsset?.id!, mintedPoints, onchainBalance);
//         }
//     });

//     pointContractUsingSDK.events.addEventListener(MONET_POINT_CONTRACT_EVENTS.TRANSFER, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_POINT_CONTRACT_EVENTS.TRANSFER) {
//             const customerAsset1 = await customerService.getCustomerPointsByPointAndWalletAddress(event.transaction.address!, event.data.from);
//             const customerAsset2 = await customerService.getCustomerPointsByPointAndWalletAddress(event.transaction.address!, event.data.to);

//             const mintedPointsFrom = await getMintedPointsForUser(event.transaction.address!, event.data.from);
//             const mintedPointsTo = await getMintedPointsForUser(event.transaction.address!, event.data.to);

//             const onchainBalanceFrom = await getOnChainBalanceForUser(event.transaction.address!, event.data.from);
//             const onchainBalanceTo = await getOnChainBalanceForUser(event.transaction.address!, event.data.to);

//             if (customerAsset1) {
//                 await customerService.updatePoints(customerAsset1?.id!, mintedPointsFrom, onchainBalanceFrom);
//             }

//             if (customerAsset2) {
//                 await customerService.updatePoints(customerAsset2?.id!, mintedPointsTo, onchainBalanceTo);
//             }
//         }
//     });
// };

// export const addEventListenerToContractEvents = async () => {
//     const contractUsingSDK = await sdk.getContract(monetPointsFactoryContractAddress, MONET_POINT_FACTORY_ABI);
//     const marketPlaceContractUsingSDK = await sdk.getContract(monetMarketPlaceContractAddress, MONET_MARKET_PLACE_ABI);

//     const pointContracts = await contractService.getAssetAddresses();

//     for (const asset of pointContracts) {
//         // const pointContractUsingSDK = await sdk.getContract(asset.pointAddress, MONET_POINT_CONTRACT_ABI);
//         // pointContractUsingSDK.events.addEventListener(MONET_POINT_CONTRACT_EVENTS.MINT, async (event) => {
//         //     // console.log(event.eventName) // the name of the emitted event
//         //     // console.log(event.data) // event payload
//         //     if (event.eventName === MONET_POINT_CONTRACT_EVENTS.MINT) {
//         //         const customerAsset = await customerService.getCustomerPointsByPointAndWalletAddress(event.transaction.address!, event.data.user);

//         //         const mintedPoints = await getMintedPointsForUser(event.transaction.address!, event.data.user);
//         //         const onchainBalance = await getOnChainBalanceForUser(event.transaction.address!, event.data.user);

//         //         await customerService.updatePoints(customerAsset?.id!, mintedPoints, onchainBalance);
//         //     }
//         // });
//         addEventListenerToPointContract(asset);
//     }

//     contractUsingSDK.events.addEventListener(MONET_POINT_FACTORY_EVENTS.CREATE, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_POINT_FACTORY_EVENTS.CREATE) {
//             await companyService.updatePointContractAddressByWallet(event.data.owner, event.data.pointAddress);
//             await approveAssetForMarketplace(event.data.pointAddress);
//             const pC = await contractService.savePointAddressForMarketPlace(event.data.owner, event.data.pointAddress, event.data.name, event.data.symbol, 0);
//             addEventListenerToPointContract(pC);
//         }
//     });

//     marketPlaceContractUsingSDK.events.addEventListener(MONET_MARKET_PLACE_EVENTS.SET_ASSET_STATUS, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_MARKET_PLACE_EVENTS.SET_ASSET_STATUS) {
//             await contractService.setAssetStatus(event.data.asset, event.data.status);
//         }
//     });

//     marketPlaceContractUsingSDK.events.addEventListener(MONET_MARKET_PLACE_EVENTS.TRADE, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_MARKET_PLACE_EVENTS.TRADE) {
//             const listing = await (readContract as any)({
//                 contract: monetMarketPlaceContract,
//                 method: "getListing",
//                 params: [event.data.listingId]
//             });
//             await contractService.updateOrInsertListing(listing);
//         }
//     });

//     marketPlaceContractUsingSDK.events.addEventListener(MONET_MARKET_PLACE_EVENTS.CANCEL_LISTING, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_MARKET_PLACE_EVENTS.CANCEL_LISTING) {
//             const listing = await (readContract as any)({
//                 contract: monetMarketPlaceContract,
//                 method: "getListing",
//                 params: [event.data.listingId]
//             });
//             await contractService.updateOrInsertListing(listing);
//         }
//     });

//     marketPlaceContractUsingSDK.events.addEventListener(MONET_MARKET_PLACE_EVENTS.ADD_ASSET, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_MARKET_PLACE_EVENTS.ADD_ASSET) {
//             // const listing = await (readContract as any)({
//             //     contract: monetMarketPlaceContract,
//             //     method: "getListing",
//             //     params: [event.data.listingId]
//             // });
//             // await contractService.updateOrInsertListing(listing);
//         }
//     });

//     marketPlaceContractUsingSDK.events.addEventListener(MONET_MARKET_PLACE_EVENTS.CREATE_LISTING, async (event) => {
//         // console.log(event.eventName) // the name of the emitted event
//         // console.log(event.data) // event payload
//         if (event.eventName === MONET_MARKET_PLACE_EVENTS.CREATE_LISTING) {
//             const listing = await (readContract as any)({
//                 contract: monetMarketPlaceContract,
//                 method: "getListing",
//                 params: [event.data.listingId]
//             });
//             await contractService.saveListing(listing);
//         }
//     });
// };

// export const getPointsDataOnChainForUserInAContract = async (walletAddress: string, contractAddress: string) => {
//     const monetPointsContract = (getContract as any)({
//         client: thirdWebClient,
//         chain: network,
//         address: contractAddress,
//         abi: MONET_POINT_CONTRACT_ABI,
//     });

//     const userPoints = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "balanceOf",
//         params: [walletAddress],
//     });

//     const userNonce = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "nonces",
//         params: [walletAddress],
//     });

//     const decimals = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "decimals",
//         params: [],
//     });

//     const name = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "name",
//     });

//     const sym = await (readContract as any)({
//         contract: monetPointsContract,
//         method: "symbol",
//     });

//     return {
//         userPoints: getPointsInEther(userPoints, decimals),
//         userNonce,
//         decimals,
//         name,
//         "symbol": sym
//     };
// };

// export const approveAssetForMarketplace = async (pointAddress: string) => {
//     const ownerWallet = privateKeyToAccount({
//         client: thirdWebClient,
//         privateKey: process.env.WALLET_PRIVATE_KEY!,
//     });

//     //prepare transaction
//     const transaction = await (prepareContractCall as any)({
//         contract: monetMarketPlaceContract,
//         method: "addAsset",
//         params: [
//             pointAddress,
//         ],
//     });

//     const result = await sendTransaction({
//         transaction,
//         account: ownerWallet,
//     });
// }

// export const getOnChainPointsForUser = async (contractAddress: string, wallet: string): Promise<number> => {
//     const contractUsingSDK = await sdk.getContract(contractAddress, MONET_POINT_CONTRACT_ABI);

//     const events = await contractUsingSDK.events.getAllEvents();
//     const decimals = await contractUsingSDK.call("decimals");
//     // console.log(decimals);

//     let userOnChainPoints = 0;

//     events.forEach(event => {
//         if (event.eventName === MONET_POINT_CONTRACT_EVENTS.MINT && event.data.user === wallet) {
//             // console.log(event.data.value);
//             userOnChainPoints += Number(getPointsInEther(event.data.value, decimals));
//         }
//     });

//     // console.log(userOnChainPoints);
//     return userOnChainPoints;
// };

// export const getMintedPointsForUser = async (contractAddress: string, wallet: string): Promise<BigInt> => {
//     const contractUsingSDK = await sdk.getContract(contractAddress, MONET_POINT_CONTRACT_ABI);

//     const events = await contractUsingSDK.events.getAllEvents();
//     // console.log(decimals);

//     let userOnChainPoints = BigInt(0);

//     events.forEach(event => {
//         if (event.eventName === MONET_POINT_CONTRACT_EVENTS.MINT && event.data.user === wallet) {
//             // console.log(event.data.value);
//             userOnChainPoints += BigInt(event.data.value);
//         }
//     });

//     // console.log(userOnChainPoints);
//     return userOnChainPoints;
// };

// export const getOnChainBalanceForUser = async (contractAddress: string, wallet: string): Promise<BigInt> => {
//     const contractUsingSDK = await sdk.getContract(contractAddress, MONET_POINT_CONTRACT_ABI);

//     const userOnChainPoints = await contractUsingSDK.call("balanceOf", [wallet]);

//     return BigInt(userOnChainPoints);
// };

// export const createASellListing = async (pointAddress: string) => {
//     const ownerWallet = privateKeyToAccount({
//         client: thirdWebClient,
//         privateKey: process.env.WALLET_PRIVATE_KEY!,
//     });

//     //prepare transaction
//     const transaction = await (prepareContractCall as any)({
//         contract: monetMarketPlaceContract,
//         method: "createListing",
//         params: [
//             pointAddress,
//             "10000",
//             getPointsInWei(0.00001, 18),
//             "0x08Bb7B2b3f3aE90DB61d515A6FE0954aE24d9212",
//             1,
//             1,
//             0
//         ],
//     });

//     const result = await sendTransaction({
//         transaction,
//         account: ownerWallet,
//     });
// }

// // export const redeemPoints = async (
// //     walletAddress: string,
// //     amount: number,
// //     signature: string
// // ) => {
// //     const ownerWallet = privateKeyToAccount({
// //         client: thirdWebClient,
// //         privateKey: process.env.WALLET_PRIVATE_KEY!,
// //     });

// //     //prepare transaction
// //     const transaction = await (prepareContractCall as any)({
// //         contract: monetpo,
// //         method: "create",
// //         params: [
// //             companyWalletAddress,
// //             decimals,
// //             pointsName,
// //             pointsSymbol,
// //         ],
// //     });

// //     const result = await sendTransaction({
// //         transaction,
// //         account: ownerWallet,
// //     });
// // }

// export const deployPointsContract = async (
//     companyWalletAddress: string,
//     decimals: number,
//     pointsName: string,
//     pointsSymbol: string
// ) => {
//     const ownerWallet = privateKeyToAccount({
//         client: thirdWebClient,
//         privateKey: process.env.WALLET_PRIVATE_KEY!,
//     });

//     //prepare transaction
//     const transaction = await (prepareContractCall as any)({
//         contract: monetPointsFactoryContract,
//         method: "create",
//         params: [
//             companyWalletAddress,
//             decimals,
//             pointsName,
//             pointsSymbol,
//         ],
//     });

//     const result = await sendTransaction({
//         transaction,
//         account: ownerWallet,
//     });
// }

// export const redeemPoints = async () => {
//     const ownerWallet = privateKeyToAccount({
//         client: thirdWebClient,
//         privateKey: process.env.WALLET_PRIVATE_KEY!,
//     });

//     const monetPointsContract = (getContract as any)({
//         client: thirdWebClient,
//         chain: network,
//         address: "0x54B41F5CC611dB91018E998B242F5F6492613Ba7",
//         abi: MONET_POINT_CONTRACT_ABI,
//     });

//     const sig = generateSignaturePointsRedemption("0x73029Df592EC27FeDddE45a512B4c42ad35A3e7d", 1, 198000, 1, "0x54B41F5CC611dB91018E998B242F5F6492613Ba7");
//     // prepare transaction
//     // const transaction = await (prepareContractCall as any)({
//     //     contract: monetPointsContract,
//     //     method: "mint",
//     //     params: [
//     //         "198000",
//     //         sig.signature
//     //     ],
//     // });

//     // const result = await sendTransaction({
//     //     transaction,
//     //     account: ownerWallet,
//     // });

//     // await redeemPoints2("0x73029Df592EC27FeDddE45a512B4c42ad35A3e7d", "0x54B41F5CC611dB91018E998B242F5F6492613Ba7", sig.signature);
// }