const getToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader.split(' ')[1];
  const authUserId = req.user.id;
  return { token, authUserId };
};

module.exports = getToken;