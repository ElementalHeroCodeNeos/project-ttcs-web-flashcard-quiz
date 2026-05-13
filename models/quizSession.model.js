const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizSession = sequelize.define('QuizSession', {
  id:              { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id:         { type: DataTypes.BIGINT, allowNull: false },
  deck_id:         { type: DataTypes.BIGINT, allowNull: false },
  quiz_type:       { type: DataTypes.STRING(30), allowNull: false },
  status:          { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'in_progress' },
  total_questions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  correct_count:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  score:           { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  started_at:      { type: DataTypes.DATE },
  submitted_at:    { type: DataTypes.DATE }
}, {
  tableName: 'quiz_attempts',
  timestamps: false
});

module.exports = QuizSession;
