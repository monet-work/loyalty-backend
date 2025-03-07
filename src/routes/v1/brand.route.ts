/* eslint-disable prettier/prettier */
import express from 'express';
import validate from '../../middlewares/validate';
import { brandValidation } from '../../validations';
import { brandAuthController, brandController } from '../../controllers';
import { BRAND_ROUTES, PROFILE_PICTURE } from '../../config/constants';
import auth from '../../middlewares/auth';
import authBrand from '../../middlewares/auth-brand';
import imageUpload from '../../middlewares/image-upload';

const router = express.Router();

router
    .route(BRAND_ROUTES.signUp)
    .post(validate(brandValidation.signUp), brandAuthController.signUp);
router
    .route(BRAND_ROUTES.verifyOTP)
    .post(validate(brandValidation.verifyOTP), brandAuthController.verifyOTP);

router
    .route(BRAND_ROUTES.login)
    .post(validate(brandValidation.login), brandAuthController.login);

router
    .route(BRAND_ROUTES.loginVerifyOTP)
    .post(validate(brandValidation.loginVerifyOTP), brandAuthController.loginVerifyOTP);

router
    .route(BRAND_ROUTES.getDashboard)
    .get(authBrand('Brand:getDashboard'), brandController.getDashboard);

router
    .route(BRAND_ROUTES.updateProfile)
    .put(authBrand('Brand:updateProfile'), validate(brandValidation.updateProfile), imageUpload.upload.single(PROFILE_PICTURE), brandAuthController.updateProfile);

router
    .route(BRAND_ROUTES.addPOCRequest)
    .post(authBrand('Brand:addPOCRequest'), validate(brandValidation.addPOCRequest), brandAuthController.addPOCRequest);

router
    .route(BRAND_ROUTES.addPOCRequest)
    .post(authBrand('Brand:addPOCRequest'), validate(brandValidation.addPOCRequest), brandAuthController.addPOCRequest);

router
    .route(BRAND_ROUTES.sendEmailRequest)
    .post(authBrand('Brand:sendEmailRequest'), validate(brandValidation.sendEmailRequest), brandAuthController.sendEmailRequest);

router
    .route(BRAND_ROUTES.verifyEmailRequest)
    .post(authBrand('Brand:verifyEmailRequest'), validate(brandValidation.verifyEmailRequest), brandAuthController.verifyEmailRequest);

router
    .route(BRAND_ROUTES.updateBusinessInfo)
    .put(authBrand('Brand:updateBusinessInfo'), validate(brandValidation.updateBusinessInfo), brandController.updateBusinessInfo);

router
    .route(BRAND_ROUTES.findTransactions)
    .get(authBrand('Brand:findTransactions'), validate(brandValidation.findTransactions), brandController.findTransactions);

router
    .route(BRAND_ROUTES.findTransaction)
    .get(authBrand('Brand:findTransaction'), validate(brandValidation.findTransaction), brandController.findTransactionById);

router
    .route(BRAND_ROUTES.profile)
    .get(authBrand('Brand:profile'), brandController.getProfile);

// router
//     .route('/:customerId/points')
//     .get(auth('findPoints'), validate(customerValidation.findPoints), customerController.findPoints);

// router
//     .route('/:customerId/redeem')
//     .post(auth('redeem'), validate(customerValidation.redeem), customerController.redeem);

// router
//     .route('/:customerId/points/:pointId')
//     .get(auth('findOnChainPointsInAContract'), validate(customerValidation.findOnChainPointsInAContract), customerController.findOnPointsForAUserInAPointContract);

// router
//     .route('/:userId')
//     .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
//     .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
//     .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

export default router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
