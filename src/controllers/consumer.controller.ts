/* eslint-disable prettier/prettier */
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { consumerService, otpService } from '../services';
import { sendOTP } from '../utils/otpless';
import tokenService from '../services/token.service';
import { Role } from '@prisma/client';
import authService from '../services/auth.service';

const getDashboard = catchAsync(async (req, res) => {
    console.log("getDashboard: ", req.user);
    res.status(200)
        .send({
            message: "Apple"
        });
    return;
});

export default {
    getDashboard
};
