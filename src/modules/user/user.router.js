const verifyJwt = require('../../middlewares/authenticate.middleware');
const verifyRole = require('../../middlewares/verifyRole.middleware');
const { createUserValidator, loginValidator, updateUserValidator, emailVerificationValidator, resetPasswordValidator, changePassLoginValidator } = require('../../validators/user.validator');
const { getAllUsers, createUser, getOneUser, removeUser, updateUser, login, bootstrapAmin, requestChangePassword, resetPasswordViaEmailLink, changePasswordWhileLoggedIn, enable2FA, verify2FA } = require('./user.controllers');
const express = require('express');

const routerUser = express.Router();

routerUser.route('/')
  .get(verifyJwt, verifyRole, getAllUsers)
  .post(verifyJwt, verifyRole, createUserValidator, createUser);

routerUser.route('/setup')
  .post(createUserValidator, bootstrapAmin);

routerUser.route('/login')
  .post(loginValidator, login);  

routerUser.route('/:id')
  .get(verifyJwt, verifyRole, getOneUser)
  .delete(verifyJwt, verifyRole, removeUser)
  .put(verifyJwt,verifyRole, updateUserValidator, updateUser);

routerUser.route('/request_password')
  .post(emailVerificationValidator, requestChangePassword);

routerUser.route('/update_password')
  .post(resetPasswordValidator, resetPasswordViaEmailLink);

routerUser.route('/password')
  .patch(verifyJwt, changePassLoginValidator, changePasswordWhileLoggedIn);

routerUser.route('/enable-2fa')
  .post(verifyJwt, resetPasswordValidator, enable2FA);

routerUser.route('/verify2FA')
  .post(verify2FA);

module.exports = routerUser;