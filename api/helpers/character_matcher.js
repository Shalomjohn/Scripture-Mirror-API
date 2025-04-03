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

  // Trait mapping for personality questions
  const personalityMap = {
    'Bold and courageous': { boldness: 2 },
    'Patient and nurturing': { patience: 2, service: 1 },
    'Strategic and thoughtful': { wisdom: 2 },
    'Humble and obedient': { service: 2, patience: 1 },
  };

  // Trait mapping for spiritual journey questions
  const spiritualMap = {
    'Face them head-on': { boldness: 1 },
    'Reflect and pray': { wisdom: 1 },
    'Seek wise counsel': { wisdom: 1 },
    'Trust Gods timing': { patience: 1 },
    'Help others in need': { service: 1 }, // Added missing option
  };

  // Process personality responses
  if (Array.isArray(responses.personality)) {
    responses.personality.forEach(answer => {
      const traits = personalityMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  // Process spiritual journey responses
  if (Array.isArray(responses.spiritual_journey)) {
    responses.spiritual_journey.forEach(answer => {
      const traits = spiritualMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  // Determine leadership style with tiebreaker
  if (profile.boldness > profile.wisdom) {
    profile.leadership = 'direct';
  } else if (profile.wisdom > profile.boldness) {
    profile.leadership = 'strategic';
  } else {
    // Tiebreaker
    profile.leadership = profile.service >= profile.patience ? 'strategic' : 'direct';
  }

  // Determine spiritual style with tiebreaker
  if (profile.service > profile.patience) {
    profile.spiritualStyle = 'active';
  } else if (profile.patience > profile.service) {
    profile.spiritualStyle = 'contemplative';
  } else {
    // Tiebreaker
    profile.spiritualStyle = profile.wisdom >= profile.boldness ? 'contemplative' : 'active';
  }

  return profile;
}

/**
 * Match name meaning to biblical themes
 * @param {string} nameMeaning - The meaning of the user's name
 * @returns {Array} - Array of matching biblical themes
 */
function matchNameMeaning(nameMeaning) {
  if (!nameMeaning || typeof nameMeaning !== 'string') {
    return [];
  }

  const nameThemes = [];
  const meaning = nameMeaning.toLowerCase();

  const themeMatchers = {
    leadership: ['leader', 'strong', 'mighty', 'power', 'king', 'rule', 'authority'],
    wisdom: ['wise', 'understanding', 'judge', 'counsel', 'knowledge', 'discern', 'insight'],
    faith: ['faithful', 'believer', 'trust', 'god', 'hope', 'believe', 'devoted'],
    service: ['helper', 'servant', 'gives', 'serves', 'assist', 'support', 'aid'],
    grace: ['blessed', 'favor', 'grace', 'gift', 'mercy', 'love', 'kindness'],
    courage: ['brave', 'courage', 'valor', 'fearless', 'bold', 'strength', 'warrior'],
    patience: ['patient', 'endure', 'wait', 'steadfast', 'persevere', 'abide'],
  };

  Object.entries(themeMatchers).forEach(([theme, keywords]) => {
    if (keywords.some(keyword => meaning.includes(keyword))) {
      nameThemes.push(theme);
    }
  });

  return nameThemes;
}

/**
 * Find the best biblical character match based on profile and name themes
 * @param {Object} profile - User's personality profile
 * @param {Array} nameThemes - Themes derived from name meaning
 * @param {string} userGender - User's gender
 * @returns {Object} - Best match and alternate match information
 */
function findBestMatch(profile, nameThemes, userGender) {
  let bestMatch = null;
  let highestScore = -1;
  let secondBestMatch = null;
  let secondHighestScore = -1;
  let matchExplanation = "";
  let verseReference = "";

  // Default fallback verse
  const defaultVerse = {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future."
  };

  biblicalCharacters.forEach(character => {
    let score = 0;
    const matchReasons = [];

    // Core trait matching
    if (character.leadership === profile.leadership) {
      score += 2;
      matchReasons.push(`leadership style (${profile.leadership})`);
    }

    if (character.spiritualStyle === profile.spiritualStyle) {
      score += 2;
      matchReasons.push(`spiritual style (${profile.spiritualStyle})`);
    }

    // Name theme matching with stronger weight
    nameThemes.forEach(theme => {
      if (character.nameThemes && character.nameThemes.includes(theme)) {
        score += 3;
        matchReasons.push(`name theme (${theme})`);
      }
    });

    // Individual trait matching
    const traitMatches = [];
    if (profile.boldness > 2 && character.traits.includes('courageous')) {
      score += 2;
      traitMatches.push('boldness');
    }

    if (profile.wisdom > 2 && character.traits.includes('wise')) {
      score += 2;
      traitMatches.push('wisdom');
    }

    if (profile.service > 2 && character.traits.includes('servant')) {
      score += 2;
      traitMatches.push('service');
    }

    if (profile.patience > 2 && character.traits.includes('patient')) {
      score += 2;
      traitMatches.push('patience');
    }

    if (traitMatches.length > 0) {
      matchReasons.push(`personal traits (${traitMatches.join(', ')})`);
    }

    // Gender matching (small bonus)
    if (userGender && character.gender === userGender) {
      score += 1;
      matchReasons.push('gender');
    }

    // Track both best and second-best matches
    if (score > highestScore) {
      secondBestMatch = bestMatch;
      secondHighestScore = highestScore;
      highestScore = score;
      bestMatch = character;

      // Store explanation for best match
      if (matchReasons.length > 0) {
        matchExplanation = `${character.name} matches your profile in: ${matchReasons.join(', ')}.`;
      }

      // Select appropriate verse based on character traits
      if (character.verses && character.verses.length > 0) {
        verseReference = character.verses[0];
      } else {
        // Assign verse based on dominant trait
        const dominantTrait = [
          { trait: 'boldness', value: profile.boldness, verse: "Joshua 1:9" },
          { trait: 'wisdom', value: profile.wisdom, verse: "Proverbs 3:13" },
          { trait: 'service', value: profile.service, verse: "Galatians 5:13" },
          { trait: 'patience', value: profile.patience, verse: "James 1:12" }
        ].sort((a, b) => b.value - a.value)[0];

        verseReference = dominantTrait.verse;
      }

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
    verseReference: verseReference || defaultVerse.reference
  };
}

// Export the functions
module.exports = { findBestMatch, calculateProfile, matchNameMeaning };