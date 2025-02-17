const { biblicalCharacters } = require("../helpers/set_characters");

// Calculate personality profile based on quiz responses
function calculateProfile(responses) {
  const profile = {
    boldness: 0,
    wisdom: 0,
    service: 0,
    patience: 0,
    leadership: '',
    spiritualStyle: '',
  };

  // Analyze personality section
  if (responses.personality) {
    const personalityMap = {
      'Bold and courageous': { boldness: 2 },
      'Patient and nurturing': { patience: 2, service: 1 },
      'Strategic and thoughtful': { wisdom: 2 },
      'Humble and obedient': { service: 2, patience: 1 },
    };

    responses.personality.forEach(answer => {
      const traits = personalityMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  // Analyze spiritual journey
  if (responses.spiritual_journey) {
    const spiritualMap = {
      'Face them head-on': { boldness: 1 },
      'Reflect and pray': { wisdom: 1 },
      'Seek wise counsel': { wisdom: 1 },
      'Trust Gods timing': { patience: 1 },
    };

    responses.spiritual_journey.forEach(answer => {
      const traits = spiritualMap[answer] || {};
      Object.entries(traits).forEach(([trait, value]) => {
        profile[trait] += value;
      });
    });
  }

  // Set dominant traits
  profile.leadership = profile.boldness > profile.wisdom ? 'direct' : 'strategic';
  profile.spiritualStyle = profile.service > profile.patience ? 'active' : 'contemplative';

  return profile;
}

// Match name meaning to biblical themes
function matchNameMeaning(nameMeaning) {
  const nameThemes = [];

  const meaning = nameMeaning.toLowerCase();

  const themeMatchers = {
    leadership: ['leader', 'strong', 'mighty', 'power'],
    wisdom: ['wise', 'understanding', 'judge', 'counsel'],
    faith: ['faithful', 'believer', 'trust', 'god'],
    service: ['helper', 'servant', 'gives', 'serves'],
    grace: ['blessed', 'favor', 'grace', 'gift'],
  };

  Object.entries(themeMatchers).forEach(([theme, keywords]) => {
    if (keywords.some(keyword => meaning.includes(keyword))) {
      nameThemes.push(theme);
    }
  });

  return nameThemes;
}

// Enhanced matching function with gender consideration
function findBestMatch(profile, nameThemes, userGender) {
  let bestMatch = null;
  let highestScore = -1;
  let secondBestMatch = null;
  let secondHighestScore = -1;

  biblicalCharacters.forEach(character => {
    let score = 0;

    // Base trait matching
    if (character.leadership === profile.leadership) score += 2;
    if (character.spiritualStyle === profile.spiritualStyle) score += 2;

    // Name theme matching
    nameThemes.forEach(theme => {
      if (character.nameThemes.includes(theme)) score += 3;
    });

    // Trait matching
    if (profile.boldness > 3 && character.traits.includes('courageous')) score += 2;
    if (profile.wisdom > 3 && character.traits.includes('wise')) score += 2;
    if (profile.service > 3 && character.traits.includes('servant')) score += 2;
    if (profile.patience > 3 && character.traits.includes('patient')) score += 2;

    // Gender matching (small bonus rather than requirement)
    if (userGender && character.gender === userGender) {
      score += 1;
    }

    // Track both best and second-best matches
    if (score > highestScore) {
      secondBestMatch = bestMatch;
      secondHighestScore = highestScore;
      highestScore = score;
      bestMatch = character;
    } else if (score > secondHighestScore) {
      secondHighestScore = score;
      secondBestMatch = character;
    }
  });

  return {
    primaryMatch: bestMatch,
    alternateMatch: secondBestMatch,
    scoreDifference: highestScore - secondHighestScore
  };
}

module.exports = { findBestMatch, calculateProfile, matchNameMeaning };