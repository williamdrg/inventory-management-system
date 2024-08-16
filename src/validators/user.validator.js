const { check } = require('express-validator');
const validateResult = require('../utils/validate');

const createUserValidator = [
  check('firstName', 'Error with the firstName attribute')
    .exists()
    .withMessage('The firstName is not being sent')
    .notEmpty()
    .withMessage('First name should not be empty')
    .isString()
    .withMessage('The data type must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('The firstName must be between 1 and 50 characters long')
    .trim(),

  check('lastName', 'Error with the lastName attribute')
    .exists()
    .withMessage('The lastName is not being sent')
    .notEmpty()
    .withMessage('Last name should not be empty')
    .isString()
    .withMessage('The data type must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('The lastName must be between 1 and 50 characters long')
    .trim(),

  check('dni', 'Error with the dni field')
    .exists()
    .withMessage('DNI is required')
    .notEmpty()
    .withMessage('DNI field cannot be empty')
    .isInt()
    .withMessage('DNI should be an integer')
    .custom(value => {
      if (value.toString().length < 7 || value.toString().length > 10) {
        throw new Error('DNI must be between 7 and 10 digits');
      }
      return true;
    }),

  check('email', 'Error with the email field')
    .exists()
    .withMessage('Email is required')
    .notEmpty()
    .withMessage('Email field cannot be empty')
    .isString()
    .withMessage('Email should be a string')
    .isEmail()
    .withMessage('Email should be a valid email address')
    .isLength({ min: 10, max: 50 })
    .withMessage('Email should be between 10 and 50 characters long')
    .trim(),

  check('password', 'Error with the password field')
    .exists()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password field cannot be empty')
    .isString()
    .withMessage('Password should be a string')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  /* 
  check('role', 'Error with the role field')
    .exists()
    .withMessage('Role is required')
    .notEmpty()
    .withMessage('Role field cannot be empty')
    .isIn(['admin', 'guest'])
    .withMessage('Role must be either \'admin\' or \'guest\''), */

  validateResult
];

module.exports = createUserValidator;