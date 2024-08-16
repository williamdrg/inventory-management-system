const verifyRole = (req, res, next) => {
  // console.log('role', req.user);
  if (req.user.role !== 'admin') {
    return next({
      status: 403,
      message: 'You do not have permission to perform this action. Admin role required.'
    });
  }
  next();
};

module.exports = verifyRole;