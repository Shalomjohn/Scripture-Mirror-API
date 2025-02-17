const mongoose = require('mongoose');

const biblicalCharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String
  },
  traits: [{
    type: String,
    trim: true
  }],
  leadership: {
    type: String
  },
  spiritualStyle: {
    type: String
  },
  challenges: [{
    type: String,
    trim: true
  }],
  nameThemes: [{
    type: String,
    trim: true
  }]
});

const BiblicalCharacter = mongoose.model('BiblicalCharacter', biblicalCharacterSchema);
module.exports = BiblicalCharacter;