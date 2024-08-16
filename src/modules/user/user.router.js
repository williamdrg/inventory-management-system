const verifyJwt = require('../../middlewares/authenticate.middleware');
const verifyRole = require('../../middlewares/verifyRole.middleware');
const createUserValidator = require('../../validators/user.validator');
const { getAll, create, getOne, remove, update, login, bootstrapAmin } = require('./user.controllers');
const express = require('express');

const routerUser = express.Router();

routerUser.route('/')
  .get(verifyJwt, verifyRole, getAll)
  .post(verifyJwt, verifyRole, createUserValidator, create);

routerUser.route('/setup')
  .post(bootstrapAmin);

routerUser.route('/login')
  .post(login);  

routerUser.route('/:id')
  .get(verifyJwt, verifyRole, getOne)
  .delete(verifyJwt, verifyRole, remove)
  .put(verifyJwt,verifyRole, update);

module.exports = routerUser;