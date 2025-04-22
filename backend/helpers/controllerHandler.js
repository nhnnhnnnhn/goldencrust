const controllerHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        res.locals.errorMessage = error.message;
        res.status(error.status || 400).json({ message: error.message });
      }
    };
  };
  
module.exports = controllerHandler;  