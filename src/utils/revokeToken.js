const TokenBlacklist = require('../models/TokenBlacklist');

const revokeToken = async (token) => {
  try {
    await TokenBlacklist.create({ token });
  } catch (error) {
    console.error('Error revoking token:', error);
    throw new Error('Failed to revoke token');
  }
};

module.exports = revokeToken;
