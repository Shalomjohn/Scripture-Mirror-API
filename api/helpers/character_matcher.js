const { biblicalCharacters } = require("../helpers/set_characters");

/**
 * Calculate personality profile based on quiz responses
 * @param {Object} responses - User's quiz responses
 * @returns {Object} - Calculated personality profile
 */
function calculateProfile(responses) {
  const profile = {
    boldness: 0,
    wisdom: 0,
    service: 0,
    patience: 0,
    leadership: '',
    spiritualStyle: '',
  };

  const personalityMap = {
    'Bold and courageous': { boldness: 2 },
    'Patient and nurturing': { patience: 2, service: 1 },
    'Strategic and thoughtful': { wisdom: 2 },
    'Humble and obedient': { service: 2, patience: 1 },
  };

  const spiritualMap = {
    'Face them head-on': { boldness: 1 },
    'Reflect and pray': { wisdom: 1 },
    'Seek wise counsel': { wisdom: 1 },
    'Trust God’s timing': { patience: 1 },
    'Help others in need': { service: 1 },
  };

  if (Array.isArray(responses.personality)) {
    responses.personality.forEach(answer => {
      const traits = personalityMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  if (Array.isArray(responses.spiritual_journey)) {
    responses.spiritual_journey.forEach(answer => {
      const traits = spiritualMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  profile.leadership = profile.boldness > profile.wisdom ? 'direct' : 'strategic';
  profile.spiritualStyle = profile.service > profile.patience ? 'active' : 'contemplative';

  return profile;
}

/**
 * Match name meaning to biblical themes
 * @param {string} nameMeaning - The meaning of the user's name
 * @returns {Array} - Array of matching biblical themes
 */
function matchNameMeaning(nameMeaning) {
  if (!nameMeaning || typeof nameMeaning !== 'string') return [];

  const themes = {
    leadership: ['leader', 'strong', 'mighty', 'king', 'rule'],
    wisdom: ['wise', 'judge', 'counsel', 'insight'],
    faith: ['faithful', 'believer', 'trust', 'hope'],
    service: ['helper', 'servant', 'support', 'aid'],
    grace: ['blessed', 'favor', 'gift', 'mercy'],
    courage: ['brave', 'courage', 'valor', 'warrior'],
    patience: ['patient', 'endure', 'wait', 'steadfast'],
  };

  return Object.entries(themes)
    .filter(([_, keywords]) => keywords.some(keyword => nameMeaning.toLowerCase().includes(keyword)))
    .map(([theme]) => theme);
}

/**
 * Find the best biblical character match based on profile and name themes
 * @param {Object} profile - User's personality profile
 * @param {Array} nameThemes - Themes derived from name meaning
 * @param {string} userGender - User's gender
 * @returns {Object} - Best match and alternate match information
 */
function findBestMatch(profile, nameThemes, userGender) {
  let bestMatch = null, secondBestMatch = null;
  let highestScore = -1, secondHighestScore = -1;
  let matchExplanation = "", verseReferences = [];

  biblicalCharacters.forEach(character => {
    let score = 0, matchReasons = [];

    if (character.leadership === profile.leadership) {
      score += 2;
      matchReasons.push(`leadership style (${profile.leadership})`);
    }
    if (character.spiritualStyle === profile.spiritualStyle) {
      score += 2;
      matchReasons.push(`spiritual style (${profile.spiritualStyle})`);
    }

    nameThemes.forEach(theme => {
      if (character.nameThemes && character.nameThemes.includes(theme)) {
        score += 3;
        matchReasons.push(`name theme (${theme})`);
      }
    });

    ['boldness', 'wisdom', 'service', 'patience'].forEach(trait => {
      if (profile[trait] > 2 && character.traits.includes(trait)) {
        score += 2;
        matchReasons.push(trait);
      }
    });

    if (userGender && character.gender === userGender) {
      score += 1;
      matchReasons.push('gender match');
    }

    if (score > highestScore) {
      secondBestMatch = bestMatch;
      secondHighestScore = highestScore;
      highestScore = score;
      bestMatch = character;
      matchExplanation = `${character.name} matches your profile in: ${matchReasons.join(', ')}.`;
      verseReferences = character.verses ? character.verses.slice(0, 3) : [];

      const dominantTraitVerses = {
        boldness: ["Joshua 1:9", "2 Timothy 1:7", "Deuteronomy 31:6"],
        wisdom: ["Proverbs 3:13", "James 1:5", "Ecclesiastes 7:12"],
        service: ["Galatians 5:13", "Mark 10:45", "Matthew 23:11"],
        patience: ["James 1:12", "Romans 5:3-4", "Psalm 27:14"]
      };

      const dominantTrait = Object.entries(profile).sort((a, b) => b[1] - a[1])[0][0];
      verseReferences = dominantTraitVerses[dominantTrait] || verseReferences;
    } else if (score > secondHighestScore) {
      secondHighestScore = score;
      secondBestMatch = character;
    }
  });

  return {
    primaryMatch: bestMatch,
    alternateMatch: secondBestMatch,
    scoreDifference: highestScore - secondHighestScore,
    matchExplanation,
    verseReferences
  };
}

module.exports = { findBestMatch, calculateProfile, matchNameMeaning };