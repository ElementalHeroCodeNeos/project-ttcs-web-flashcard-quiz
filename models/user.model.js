const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:            { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  full_name:     { type: DataTypes.STRING(255), allowNull: false },
  email:         { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  avatar_url:    { type: DataTypes.TEXT },
  role:          { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
  status:        { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  created_at:    { type: DataTypes.DATE },
  updated_at:    { type: DataTypes.DATE }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
