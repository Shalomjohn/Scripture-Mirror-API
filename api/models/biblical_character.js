const mongoose = require('mongoose');

const biblicalCharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameMeaning: {
    type: String,
    required: true
  },
  significance: [String],
  characteristics: [String],
  biblicalReferences: [{
    book: String,
    chapter: Number,
    verse: Number,
    text: String
  }],
  story: String,
  virtues: [String],
  challenges: [String]
});

const BiblicalCharacter = mongoose.model('BiblicalCharacter', biblicalCharacterSchema);
module.exports = BiblicalCharacter;