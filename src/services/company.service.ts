// /* eslint-disable prettier/prettier */
// import { User, Role, Prisma, company, customer_points } from '@prisma/client';
// import httpStatus from 'http-status';
// import prisma from '../client';
// import ApiError from '../utils/ApiError';
// import { encryptPassword } from '../utils/encryption';
// import { randomUUID } from 'crypto';

// /**
//  * Create a company
//  * @param {Object} companyBody
//  * @returns {Promise<User>}
//  */
// const createCompany = async (
//     name: string,
//     description: string,
//     pointName: string,
//     pointSymbol: string,
//     userId: string,
//     decimal: number
// ): Promise<company> => {
//     // if (await getUserByEmail(email)) {
//     //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//     // }
//     return await prisma.company.create({
//         data: {
//             name: name,
//             point_name: pointName,
//             point_symbol: pointSymbol,
//             description: description,
//             userId: userId,
//             decimal: decimal
//         }
//     });
// };

// // const createCompany = async (
// //     pointName: string,
// //     pointSymbol: string,
// //     name?: string,
// // ): Promise<User> => {
// //     if (await getUserByEmail(email)) {
// //         throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
// //     }
// //     return prisma.user.create({
// //         data: {
// //             email,
// //             name,
// //             password: await encryptPassword(password),
// //             role
// //         }
// //     });
// // };

// /**
//  * Query for users
//  * @param {Object} filter - Prisma filter
//  * @param {Object} options - Query options
//  * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
//  * @param {number} [options.limit] - Maximum number of results per page (default = 10)
//  * @param {number} [options.page] - Current page (default = 1)
//  * @returns {Promise<QueryResult>}
//  */
// const queryUsers = async <Key extends keyof User>(
//     filter: object,
//     options: {
//         limit?: number;
//         page?: number;
//         sortBy?: string;
//         sortType?: 'asc' | 'desc';
//     },
//     keys: Key[] = [
//         'id',
//         'email',
//         'name',
//         'password',
//         'role',
//         'isEmailVerified',
//         'createdAt',
//         'updatedAt'
//     ] as Key[]
// ): Promise<Pick<User, Key>[]> => {
//     const page = options.page ?? 1;
//     const limit = options.limit ?? 10;
//     const sortBy = options.sortBy;
//     const sortType = options.sortType ?? 'desc';
//     const users = await prisma.user.findMany({
//         where: filter,
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
//         skip: page * limit,
//         take: limit,
//         orderBy: sortBy ? { [sortBy]: sortType } : undefined
//     });
//     return users as Pick<User, Key>[];
// };

// /**
//  * Get user by id
//  * @param {ObjectId} id
//  * @param {Array<Key>} keys
//  * @returns {Promise<Pick<User, Key> | null>}
//  */
// const getUserById = async <Key extends keyof User>(
//     id: string,
//     keys: Key[] = [
//         'id',
//         'email',
//         'name',
//         'password',
//         'role',
//         'isEmailVerified',
//         'createdAt',
//         'updatedAt'
//     ] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//     return await prisma.user.findUnique({
//         where: { id },
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     }) as Promise<Pick<User, Key> | null>;
// };

// const getCompanyByUserId = async <Key extends keyof company>(
//     id: string,
//     keys: Key[] = [
//         'id',
//         'is_approved',
//         'point_contract_address',
//         'point_name',
//         'point_symbol',
//         'name',
//         'created_at',
//         'updated_at',
//         'description',
//     ] as Key[]
// ): Promise<Pick<company, Key> | null> => {
//     return await prisma.company.findFirst({
//         where: { userId: id },
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     }) as Promise<Pick<company, Key> | null>;
// };

// /**
//  * Get user by email
//  * @param {string} email
//  * @param {Array<Key>} keys
//  * @returns {Promise<Pick<User, Key> | null>}
//  */
// const getUserByEmail = async <Key extends keyof User>(
//     email: string,
//     keys: Key[] = [
//         'id',
//         'email',
//         'name',
//         'password',
//         'role',
//         'isEmailVerified',
//         'createdAt',
//         'updatedAt'
//     ] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//     return await prisma.user.findUnique({
//         where: { email },
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     }) as Promise<Pick<User, Key> | null>;
// };

// /**
//  * Update user by id
//  * @param {ObjectId} userId
//  * @param {Object} updateBody
//  * @returns {Promise<User>}
//  */
// const updateUserById = async <Key extends keyof User>(
//     userId: string,
//     updateBody: Prisma.UserUpdateInput,
//     keys: Key[] = ['id', 'email', 'name', 'role'] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//     const user = await getUserById(userId, ['id', 'email', 'name']);
//     if (!user) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//     }
//     if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
//         throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//     }
//     const updatedUser = await prisma.user.update({
//         where: { id: user.id },
//         data: updateBody,
//         select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//     });
//     return updatedUser as Pick<User, Key> | null;
// };

// /**
//  * Delete user by id
//  * @param {ObjectId} userId
//  * @returns {Promise<User>}
//  */
// const deleteUserById = async (userId: string): Promise<User> => {
//     const user = await getUserById(userId);
//     if (!user) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//     }
//     await prisma.user.delete({ where: { id: user.id } });
//     return user;
// };

// type CustomerPointData = {
//     walletAddress: string,
//     points: number,
//     name: string | undefined
// };

// const createCustomerPoints = async (companyId: string, customerPoints: CustomerPointData[]): Promise<customer_points[]> => {
//     let values = '';

//     customerPoints.forEach(customerPoint => {
//         values += '(' + `'${randomUUID()}'` + ',' + `'${customerPoint.name || ""}'` + ',' + `'${companyId}'` + ',' + `'${customerPoint.walletAddress}'` + ',' + customerPoint.points + '),';
//     });

//     values = values.slice(0, values.length - 1);

//     const query = `INSERT INTO customer_points (id, name, company_id, wallet_address, points)
//     VALUES ${values}
//     ON CONFLICT (company_id, wallet_address) DO UPDATE
//     SET points = EXCLUDED.points`;

//     await prisma.$queryRaw<customer_points[]>`${Prisma.raw(query)}`;

//     return await prisma.customer_points.findMany({
//         where: {
//             company_id: companyId
//         }
//     });
// };

// const deletePoint = async (companyId: string, pointId: string): Promise<customer_points | null> => {
//     let point = await prisma.customer_points.findFirst({
//         where: {
//             company_id: companyId,
//             id: pointId
//         }
//     });

//     if (!point) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Point does not exist");
//     }

//     try {
//         point = await prisma.customer_points.delete({
//             where: {
//                 id: pointId
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         return null;
//     }

//     return point;
// };

// const getCustomerPoints = async (
//     id: string,
// ): Promise<customer_points[] | null> => {
//     return prisma.customer_points.findMany({
//         where: { company_id: id }
//     }) as Promise<customer_points[] | null>;
// };

// const updatePointContractAddressByWallet = async (
//     walletAddress: string,
//     pointContractAddress: string
// ): Promise<company | null> => {
//     const user = await prisma.user.findUnique({
//         where: {
//             wallet_address: walletAddress
//         }
//     });

//     if (user) {
//         const company = await prisma.company.findUnique({
//             where: {
//                 userId: user.id
//             }
//         });

//         if (company && !company.point_contract_address) {
//             return await prisma.company.update({
//                 data: {
//                     point_contract_address: pointContractAddress // replace this with point contract address
//                 },
//                 where: { id: company.id }
//             });
//         }
//     }

//     return null;
// }

// export default {
//     createCompany,
//     queryUsers,
//     getUserById,
//     getUserByEmail,
//     updateUserById,
//     deleteUserById,
//     getCompanyByUserId,
//     createCustomerPoints,
//     getCustomerPoints,
//     updatePointContractAddressByWallet,
//     deletePoint
// };
