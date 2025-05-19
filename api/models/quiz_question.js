// src/models/quiz_question.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizQuestionSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  options: [String],
  allowMultiple: {
    type: Boolean,
    default: false
  },
  allowCustomInput: {
    type: Boolean,
    default: false
  },
  sectionId: {
    type: String,
    required: true,
    ref: 'QuizSection'
  },
  order: {
    type: Number,
    required: true
  }
});

const QuizQuestion = mongoose.model('QuizQuestion', QuizQuestionSchema);
module.exports = QuizQuestion;