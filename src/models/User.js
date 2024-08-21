const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  dni: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'guest'),
    allowNull: false,
    defaultValue: 'guest'
  },
  resetTokenUsed: {
    type: DataTypes.BOOLEAN(false),
    defaultValue: false
  },
  failedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  twoFactorCode: {
    type: DataTypes.INTEGER
  },
  twoFactorExpires: {
    type: DataTypes.DATE,
  }
},{
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
      }
    }
  }
}

);

module.exports = User;