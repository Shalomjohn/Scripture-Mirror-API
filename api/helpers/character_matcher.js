// src/utils/characterMatcher.js
const natural = require('natural');
const BiblicalCharacter = require('../models/biblical_character');

class CharacterMatcher {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  // Preprocess text for matching
  preprocess(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    return tokens.map(token => this.stemmer.stem(token));
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const tokens1 = this.preprocess(str1);
    const tokens2 = this.preprocess(str2);
    
    // Use Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  // Calculate virtue match score
  calculateVirtueMatch(userVirtues, characterVirtues) {
    let matchScore = 0;
    userVirtues.forEach(virtue => {
      characterVirtues.forEach(charVirtue => {
        matchScore += this.calculateSimilarity(virtue, charVirtue);
      });
    });
    return matchScore / (userVirtues.length * characterVirtues.length);
  }

  // Main matching algorithm
  async findMatch(userData) {
    try {
      const characters = await BiblicalCharacter.find({});
      const matches = characters.map(character => {
        // Calculate name meaning similarity
        const nameMeaningScore = this.calculateSimilarity(
          userData.nameMeaning,
          character.nameMeaning
        ) * 0.4; // 40% weight

        // Calculate virtue match
        const virtueScore = this.calculateVirtueMatch(
          userData.virtues || [],
          character.virtues
        ) * 0.3; // 30% weight

        // Calculate characteristic match
        const characteristicScore = this.calculateVirtueMatch(
          userData.characteristics || [],
          character.characteristics
        ) * 0.3; // 30% weight

        const totalScore = nameMeaningScore + virtueScore + characteristicScore;

        return {
          characterMatch: character,
          matchScore: totalScore,
          matchDetails: {
            nameMeaningMatch: nameMeaningScore,
            virtueMatch: virtueScore,
            characteristicMatch: characteristicScore
          }
        };
      });

      // Sort by match score and return top matches
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)[0];
    } catch (error) {
      throw new Error('Error finding character matches: ' + error.message);
    }
  }
}

module.exports = CharacterMatcher;