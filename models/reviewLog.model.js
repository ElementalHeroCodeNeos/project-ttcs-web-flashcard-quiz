const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewLog = sequelize.define('ReviewLog', {
  id:                      { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  study_progress_id:       { type: DataTypes.BIGINT, allowNull: false },
  rating:                  { type: DataTypes.STRING(20), allowNull: false },
  reviewed_at:             { type: DataTypes.DATE },
  previous_interval_days:  { type: DataTypes.INTEGER },
  new_interval_days:       { type: DataTypes.INTEGER },
  previous_due_date:       { type: DataTypes.DATEONLY },
  next_due_date:           { type: DataTypes.DATEONLY },
  previous_ease_factor:    { type: DataTypes.DECIMAL(4, 2) },
  new_ease_factor:         { type: DataTypes.DECIMAL(4, 2) }
}, {
  tableName: 'review_logs',
  timestamps: false
});

module.exports = ReviewLog;
