const { check } = require('express-validator');
const validateResult = require('../utils/validate');

const createUserValidator = [
  check('firstName')
    .exists({ checkFalsy: true }).withMessage('First name is required')
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters long'),

  check('lastName')
    .exists({ checkFalsy: true }).withMessage('Last name is required')
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters long'),

  check('dni')
    .exists({ checkFalsy: true }).withMessage('DNI is required')
    .isInt().withMessage('DNI must be an integer')
    .isLength({ min: 7, max: 10 }).withMessage('DNI must be between 7 and 10 digits'),

  check('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ min: 10, max: 50 }).withMessage('Email must be between 10 and 50 characters long'),

  check('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),

  validateResult
];

const loginValidator = [
  check('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .isEmail().withMessage('Email should be a valid email address')
    .isLength({ min: 10, max: 50 }).withMessage('Email should be between 10 and 50 characters long')
    .trim(),

  check('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .isString().withMessage('Password should be a string')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),
  
  validateResult
];

const updateUserValidator = [
  check('firstName')
    .optional()
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters long'),

  check('lastName')
    .optional()
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters long'),

  check('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ min: 10, max: 50 }).withMessage('Email must be between 10 and 50 characters long'),

  validateResult
];


module.exports = {
  createUserValidator,
  loginValidator,
  updateUserValidator
};