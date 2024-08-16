const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Supplier = sequelize.define('supplier', {
  name: {
    type: DataTypes.STRING(30),
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
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(30),
  },
  address: {
    type: DataTypes.STRING(100),
  },
});

module.exports = Supplier;