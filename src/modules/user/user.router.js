const verifyJwt = require('../../middlewares/authenticate.middleware');
const verifyRole = require('../../middlewares/verifyRole.middleware');
const { createUserValidator, loginValidator, updateUserValidator, emailVerificationValidator, resetPasswordValidator } = require('../../validators/user.validator');
const { getAll, create, getOne, remove, update, login, bootstrapAmin, requestChangePassword, updatePassword } = require('./user.controllers');
const express = require('express');

const routerUser = express.Router();

routerUser.route('/')
  .get(verifyJwt, verifyRole, getAll)
  .post(verifyJwt, verifyRole, createUserValidator, create);

routerUser.route('/setup')
  .post(createUserValidator, bootstrapAmin);

routerUser.route('/login')
  .post(loginValidator, login);  

routerUser.route('/:id')
  .get(verifyJwt, verifyRole, getOne)
  .delete(verifyJwt, verifyRole, remove)
  .put(verifyJwt,verifyRole, updateUserValidator, update);

routerUser.route('/request_password')
  .post(emailVerificationValidator, requestChangePassword);

routerUser.route('/update_password')
  .post(resetPasswordValidator, updatePassword);

module.exports = routerUser;