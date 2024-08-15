const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');
require('dotenv').config();

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next({
      status: 401,
      name: 'no token provided',
      message: 'You must provide a valid token to access this resource.'
    });
  }
  
  const token = authHeader.split(' ')[1];

  const blacklistedToken = await TokenBlacklist.findOne({ where: { token } });
  if (blacklistedToken) {
    return next({
      status: 403,
      name: 'InvalidToken',
      message: 'The token provided has been revoked.'
    });
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    { algorithms: ['HS512'] },
    (err, decoded) => {
      if (err) {
        return next({
          status: 403,
          name: 'InvalidToken',
          message: 'The token provided is invalid or has expired.',
          error: err.message
        });
      }
      req.user = decoded;
      next();
    }
  );
};

module.exports = verifyJwt;