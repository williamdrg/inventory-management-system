const { 
  ValidationError,
  DatabaseError,
  ConnectionAcquireTimeoutError,
  ConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  InvalidConnectionError
} = require('sequelize');

const displayError = (err, req, res, next) => {
  console.log(err);
  next(err);
};

const ormErrorHandler = (err, req, res, next) => {
  if (
    err instanceof ConnectionError ||
    err instanceof ConnectionAcquireTimeoutError ||
    err instanceof ConnectionRefusedError ||
    err instanceof ConnectionTimedOutError ||
    err instanceof InvalidConnectionError
  ) {
    return res.status(409).json({
      name: err.name,
      message: 'Database conection error'
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      name: err.name,
      message: err.message,
      erros: err.errors
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(409).json({
      name: err.name,
      message: err.message,
      errors: err.errors
    });
  }
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const { status } = err;
  return res.status(status || 500).json({
    errorName: err.name,
    message: err.message,
  });
};


module.exports = {
  displayError,
  ormErrorHandler,
  errorHandler,
};