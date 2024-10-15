import express from 'express';
import authRoute from './auth.route';
// import userRoute from './user.route';
import consumerRoute from './consumer.route';
// import customerRoute from './customer.route';
// import monetAdminRoute from './monet-admin.route';
// import marketPlaceRoute from './marketplace.route';
import brandRoute from './brand.route';
import docsRoute from './docs.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/consumers',
    route: consumerRoute
  },
  {
    path: '/brands',
    route: brandRoute
  },
  // {
  //   path: '/companies',
  //   route: companyRoute
  // },
  // {
  //   path: '/customers',
  //   route: customerRoute
  // },
  // {
  //   path: '/admins',
  //   route: monetAdminRoute
  // },
  // {
  //   path: '/marketplace',
  //   route: marketPlaceRoute
  // }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
