// /* eslint-disable prettier/prettier */
// import { User, Role, Prisma, company, customer, role } from '@prisma/client';
// import httpStatus from 'http-status';
// import prisma from '../client';
// import ApiError from '../utils/ApiError';
// import { encryptPassword } from '../utils/encryption';
// import { deployPointsContract } from '../utils/contract-helper';

// const getAdminByWalletAddress = async (
//     walletAddress: string
// ): Promise<(User & { roles: role[]; }) | null> => {
//     const user = await prisma.user.findFirst({
//         where: { wallet_address: walletAddress },
//         include: {
//             roles: true
//         }
//     });

//     if (!user) {
//         return null;
//     }

//     const adminRole = user.roles.filter(_role => _role.role === Role.ADMIN);

//     if (adminRole.length > 0) {
//         return user;
//     }

//     return null;

// };

// const approveCompany = async (
//     companyId: string,
//     approve: boolean
// ): Promise<company | null> => {
//     const company = await prisma.company.update({
//         data: {
//             is_approved: approve
//         },
//         include: {
//             user: {
//                 select: {
//                     wallet_address: true
//                 }
//             }
//         },
//         where: { id: companyId }
//     });

//     if (company.is_approved && !company.point_contract_address) {
//         // we approve the company but point contract address does not exist
//         // deploy one for company
//         await deployPointsContract(company.user.wallet_address, company.decimal, company.point_name, company.point_symbol);
//     }

//     return company;
// };

// const findCompanies = async (): Promise<company[] | null> => {
//     const companies = await prisma.company.findMany({
//         include: {
//             user: {
//                 select: {
//                     wallet_address: true,
//                     email: true
//                 }
//             }
//         }
//     });
//     return companies;
// }

// const findCustomers = async (): Promise<customer[] | null> => {
//     const customers = await prisma.customer.findMany({
//         include: {
//             user: {
//                 select: {
//                     wallet_address: true,
//                     email: true
//                 }
//             }
//         }
//     });
//     return customers;
// }

// export default {
//     getAdminByWalletAddress,
//     approveCompany,
//     findCompanies,
//     findCustomers
// };
