const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedDeck = sequelize.define('SavedDeck', {
  id:         { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.BIGINT, allowNull: false },
  deck_id:    { type: DataTypes.BIGINT, allowNull: false },
  status:     { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  saved_at:   { type: DataTypes.DATE },
  removed_at: { type: DataTypes.DATE }
}, {
  tableName: 'saved_decks',
  timestamps: false
});

module.exports = SavedDeck;
