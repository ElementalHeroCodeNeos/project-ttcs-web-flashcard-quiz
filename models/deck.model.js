const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Deck = sequelize.define('Deck', {
  id:           { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  owner_id:     { type: DataTypes.BIGINT, allowNull: false },
  category_id:  { type: DataTypes.BIGINT, allowNull: false },
  title:        { type: DataTypes.STRING(255), allowNull: false },
  description:  { type: DataTypes.TEXT },
  visibility:   { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'private' },
  status:       { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  created_at:   { type: DataTypes.DATE },
  updated_at:   { type: DataTypes.DATE },
  published_at: { type: DataTypes.DATE },
  deleted_at:   { type: DataTypes.DATE }
}, {
  tableName: 'decks',
  timestamps: false
});

module.exports = Deck;
