// /* eslint-disable prettier/prettier */
// import { baseSepolia } from "thirdweb/chains";
// import { Web3 } from "web3";
// import { MONET_POINT_CONTRACT_ABI } from "../config/abi";

// const web3 = new Web3(baseSepolia.rpc);

// export const generateSignaturePointsRedemption = (walletAddress: string, decimal: number, amount: number, nonce: number, contractAddr: string) => {
//     const encodedMessage = web3.utils.soliditySha3(
//         { t: "address", v: walletAddress },
//         { t: "uint256", v: amount },
//         { t: "uint256", v: nonce },
//         { t: "address", v: contractAddr },
//     );
//     const sig = web3.eth.accounts.sign(
//         encodedMessage as string,
//         "0x" + process.env.WALLET_PRIVATE_KEY!,
//     );

//     return sig;
// };

// export const redeemPoints2 = async (walletAddress: string, contractAddr: string, signature: string) => {
//     const contract = new web3.eth.Contract(MONET_POINT_CONTRACT_ABI, contractAddr);
//     const nonce = await contract.methods.nonces(walletAddress).call();
//     console.log(nonce);
//     // @yusuf kelo - uncomment from 29 to 32
//     const o = await contract.methods.mint(198000, signature).send({
//         from: walletAddress,
//     });
//     console.log(o);
// }

// export const getPointsInEther = (points: number, decimals: number) => {
//     return web3.utils.fromWei(points, decimals);
// };

// export const getPointsInEther2 = (points: string, decimals: number) => {
//     return web3.utils.fromWei(points, decimals);
// };

// export const getPointsInWei = (points: number, decimals: number) => {
//     return web3.utils.toWei(points, decimals);
// }