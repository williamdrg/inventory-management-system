const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const TokenBlacklist = sequelize.define('tokenBlacklist', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
});

module.exports = TokenBlacklist;