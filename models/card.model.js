const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Card = sequelize.define('Card', {
  id:         { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  deck_id:    { type: DataTypes.BIGINT, allowNull: false },
  front:      { type: DataTypes.TEXT, allowNull: false },
  back:       { type: DataTypes.TEXT, allowNull: false },
  position:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status:     { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
  deleted_at: { type: DataTypes.DATE }
}, {
  tableName: 'cards',
  timestamps: false
});

module.exports = Card;
