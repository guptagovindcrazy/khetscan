const AppError = require('../utils/AppError');

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

module.exports = (req, _res, next) => {
  if (!OBJECT_ID.test(req.params.id)) {
    return next(new AppError(400, 'INVALID_ID', 'That prediction ID is not valid.'));
  }
  next();
};
