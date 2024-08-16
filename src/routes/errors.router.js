const { 
  displayError,
  ormErrorHandler,
  errorHandler 
} = require('../middlewares/errorHandlers.middleware');

const errorRouter = (app) => {
  app.use(displayError, ormErrorHandler, errorHandler);

  app.use('*', (req, res) => {  
    res.status(404).json({
      message: 'We\'re sorry, the page you\'re looking for is not available at the moment. It\'s possible that the content has been deleted, moved, or you may have entered an incorrect address. Please verify the URL and try again.'
    });
  });
};

module.exports = errorRouter;