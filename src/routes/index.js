const express = require('express');
const routerUser = require('../modules/user/user.router');
const router = express.Router();

router.use('/users', routerUser);

module.exports = router;