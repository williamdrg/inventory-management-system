const { validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    return res.status(400).json({
      status: 400,
      error: 'validate error',
      messages: error.errors.map(err => err.msg)
    });
  }
};

module.exports = validateResult;