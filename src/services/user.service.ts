// /* eslint-disable prettier/prettier */
// import { User, Role, Prisma, role } from '@prisma/client';
// import httpStatus from 'http-status';
// import prisma from '../client';
// import ApiError from '../utils/ApiError';
// import { encryptPassword } from '../utils/encryption';
// import { roles } from '../config/roles';

// /**
//  * Create a user
//  * @param {Object} userBody
//  * @returns {Promise<User>}
//  */
// const createUser = async (
//   walletAddress: string,
//   email: string,
//   role: Role = Role.USER
// ): Promise<User | null> => {
//   if (await getUserByWalletAddress(walletAddress)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Wallet Address already in use');
//   }
//   const user = await prisma.user.create({
//     data: {
//       wallet_address: walletAddress,
//       email: email,
//     },
//     include: {
//       roles: true
//     }
//   });

//   const roles = user.roles.filter(_role => _role.role === role);

//   if (roles.length > 0) {
//     // meaning the role exists
//     return user;
//   }

//   await prisma.role.create({
//     data: {
//       userId: user.id,
//       role: role
//     }
//   });

//   return await prisma.user.findFirst({
//     where: {
//       id: user.id
//     },
//     include: {
//       roles: true
//     }
//   });
// };

// /**
//  * Create a user with the role
//  * @param {Object} userBody
//  * @returns {Promise<User>}
//  */
// const createRoleForUser = async (
//   id: string,
//   role: Role = Role.USER
// ): Promise<role> => {
//   let roleData = await prisma.role.findFirst({
//     where: {
//       userId: id,
//       role: role
//     }
//   });

//   if (roleData) {
//     // meaning the role exists
//     return roleData;
//   }

//   roleData = await prisma.role.create({
//     data: {
//       userId: id,
//       role: role
//     }
//   });

//   return roleData;
// };

// /**
//  * Get roles of the user
//  * @param {Object} userBody
//  * @returns {Promise<User>}
//  */
// const findRolesForUser = async (
//   id: string
// ): Promise<role[]> => {
//   const roleData = await prisma.role.findMany({
//     where: {
//       userId: id,
//     }
//   });

//   return roleData;
// };

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
//   filter: object,
//   options: {
//     limit?: number;
//     page?: number;
//     sortBy?: string;
//     sortType?: 'asc' | 'desc';
//   },
//   keys: Key[] = [
//     'id',
//     'email',
//     'name',
//     'password',
//     'isEmailVerified',
//     'createdAt',
//     'updatedAt'
//   ] as Key[]
// ): Promise<Pick<User, Key>[]> => {
//   const page = options.page ?? 1;
//   const limit = options.limit ?? 10;
//   const sortBy = options.sortBy;
//   const sortType = options.sortType ?? 'desc';
//   const users = await prisma.user.findMany({
//     where: filter,
//     select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
//     skip: page * limit,
//     take: limit,
//     orderBy: sortBy ? { [sortBy]: sortType } : undefined
//   });
//   return users as Pick<User, Key>[];
// };

// /**
//  * Get user by id
//  * @param {ObjectId} id
//  * @param {Array<Key>} keys
//  * @returns {Promise<Pick<User, Key> | null>}
//  */
// const getUserById = async <Key extends keyof User>(
//   id: string,
//   keys: Key[] = [
//     'id',
//     'email',
//     'name',
//     'password',
//     'isEmailVerified',
//     'createdAt',
//     'updatedAt',
//     'wallet_address'
//   ] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//   return await prisma.user.findUnique({
//     where: { id },
//     select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//   }) as Promise<Pick<User, Key> | null>;
// };

// /**
//  * Get user by email
//  * @param {string} email
//  * @param {Array<Key>} keys
//  * @returns {Promise<Pick<User, Key> | null>}
//  */
// const getUserByEmail = async <Key extends keyof User>(
//   email: string,
//   keys: Key[] = [
//     'id',
//     'email',
//     'name',
//     'password',
//     'isEmailVerified',
//     'createdAt',
//     'updatedAt'
//   ] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//   return await prisma.user.findUnique({
//     where: { email },
//     select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//   }) as Promise<Pick<User, Key> | null>;
// };

// /**
//  * Get user by wallet address
//  * @param {string} email
//  * @param {Array<Key>} keys
//  * @returns {Promise<Pick<User, Key> | null>}
//  */
// const getUserByWalletAddress = async <Key extends keyof User>(
//   walletAddress: string,
//   keys: Key[] = [
//     'id',
//     'isEmailVerified',
//     'createdAt',
//     'updatedAt',
//   ] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//   return await prisma.user.findFirst({
//     where: { wallet_address: walletAddress },
//     select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//   }) as Promise<Pick<User, Key> | null>;
// };

// /**
//  * Update user by id
//  * @param {ObjectId} userId
//  * @param {Object} updateBody
//  * @returns {Promise<User>}
//  */
// const updateUserById = async <Key extends keyof User>(
//   userId: string,
//   updateBody: Prisma.UserUpdateInput,
//   keys: Key[] = ['id', 'email', 'name', 'role'] as Key[]
// ): Promise<Pick<User, Key> | null> => {
//   const user = await getUserById(userId, ['id', 'email', 'name']);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//   }
//   const updatedUser = await prisma.user.update({
//     where: { id: user.id },
//     data: updateBody,
//     select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
//   });
//   return updatedUser as Pick<User, Key> | null;
// };

// /**
//  * Delete user by id
//  * @param {ObjectId} userId
//  * @returns {Promise<User>}
//  */
// // const deleteUserById = async (userId: number): Promise<User> => {
// //   const user = await getUserById(userId);
// //   if (!user) {
// //     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
// //   }
// //   await prisma.user.delete({ where: { id: user.id } });
// //   return user;
// // };

// export default {
//   createRoleForUser,
//   createUser,
//   getUserByWalletAddress,
//   queryUsers,
//   getUserById,
//   getUserByEmail,
//   updateUserById,
//   findRolesForUser
// };
