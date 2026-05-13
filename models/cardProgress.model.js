const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CardProgress = sequelize.define('CardProgress', {
  id:               { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id:          { type: DataTypes.BIGINT, allowNull: false },
  card_id:          { type: DataTypes.BIGINT, allowNull: false },
  repetitions:      { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  interval_days:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ease_factor:      { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 2.50 },
  due_date:         { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  lapse_count:      { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_difficult:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  last_reviewed_at: { type: DataTypes.DATE },
  created_at:       { type: DataTypes.DATE },
  updated_at:       { type: DataTypes.DATE }
}, {
  tableName: 'study_progress',
  timestamps: false
});

module.exports = CardProgress;
