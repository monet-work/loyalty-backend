// /* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import authService from '../services/auth.service';
// import { authService, userService, tokenService, emailService } from '../services';
// import exclude from '../utils/exclude';
// import { User } from '@prisma/client';
// import { deployPointsContract } from '../utils/contract-helper';

// // const register = catchAsync(async (req, res) => {
// //   const { email, password } = req.body;
// //   const user = await userService.createUser(email, password);
// //   const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
// //   const tokens = await tokenService.generateAuthTokens(user);
// //   res.status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
// // });

// const login = catchAsync(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await authService.loginUserWithEmailAndPassword(email, password);
//   const tokens = await tokenService.generateAuthTokens(user);
//   res.send({ user, tokens });
// });

const logout = catchAsync(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
});

// // const forgotPassword = catchAsync(async (req, res) => {
// //   const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
// //   await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
// //   res.status(httpStatus.NO_CONTENT).send();
// // });

// const resetPassword = catchAsync(async (req, res) => {
//   await authService.resetPassword(req.query.token as string, req.body.password);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// // const sendVerificationEmail = catchAsync(async (req, res) => {
// //   const user = req.user as User;
// //   const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
// //   await emailService.sendVerificationEmail(user.email, verifyEmailToken);
// //   res.status(httpStatus.NO_CONTENT).send();
// // });

// const verifyEmail = catchAsync(async (req, res) => {
//   await authService.verifyEmail(req.query.token as string);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const getUser = catchAsync(async (req, res) => {
//   // console.log(await deployPointsContract("0xdf2003b15Bcf8566B2Bc44763B53DD424065f1aF", 1, "APPLE", "MICROSOFT"));
//   res.status(httpStatus.OK).send(req.user);
// });

export default {
    //   // register,
    //   getUser,
    //   login,
    logout,
    refreshTokens,
    //   // forgotPassword,
    //   resetPassword,
    //   // sendVerificationEmail,
    //   verifyEmail
};
