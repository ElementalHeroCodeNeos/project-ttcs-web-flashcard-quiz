const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAnswer = sequelize.define('QuizAnswer', {
  id:             { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  attempt_id:     { type: DataTypes.BIGINT, allowNull: false },
  card_id:        { type: DataTypes.BIGINT },
  question_text:  { type: DataTypes.TEXT, allowNull: false },
  correct_answer: { type: DataTypes.TEXT, allowNull: false },
  user_answer:    { type: DataTypes.TEXT },
  answer_options: { type: DataTypes.JSONB },
  is_correct:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  position:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'quiz_attempt_items',
  timestamps: false
});

module.exports = QuizAnswer;
