const verifyJwt = require('../../middlewares/authenticate.middleware');
const verifyRole = require('../../middlewares/verifyRole.middleware');
const { createUserValidator, loginValidator, updateUserValidator } = require('../../validators/user.validator');
const { getAll, create, getOne, remove, update, login, bootstrapAmin } = require('./user.controllers');
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

module.exports = routerUser;