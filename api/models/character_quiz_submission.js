// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

// Schema for the complete quiz submission
const QuizSubmissionSchema = new Schema({
  // User information
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Name meaning information
  nameMeaning: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  // Optional gender field
  gender: {
    type: String,
    enum: ['male', 'female', ''],
    default: ''
  },

  // Quiz section responses - using Mixed type for flexible structure
  quizResponses: {
    type: Schema.Types.Mixed,
    required: true
  },

  // Results from character matching
  matchResult: {
    primaryMatch: {
      name: String,
      score: Number,
      traits: [String],
      explanation: String
    },
    alternateMatch: {
      name: String,
      score: Number,
      gender: String,
      traits: [String],
      explanation: String
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a method to get the quiz responses in the format needed for matching
QuizSubmissionSchema.methods.getResponsesForMatching = function () {
  const responses = {};

  Object.entries(this.quizResponses).forEach(([section, data]) => {
    responses[section] = data.answers;
  });

  return responses;
};

// Create the model
const QuizSubmission = mongoose.model('QuizSubmission', QuizSubmissionSchema);

module.exports = { QuizSubmissionSchema, QuizSubmission };