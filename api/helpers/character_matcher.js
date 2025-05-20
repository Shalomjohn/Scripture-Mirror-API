const { biblicalCharacters } = require("../helpers/set_characters");

function calculateProfile(responses) {
  const profile = {
    boldness: 0,
    wisdom: 0,
    service: 0,
    patience: 0,
    faith: 0,
    leadership: 0,
    humility: 0,
    resilience: 0,
    leadershipStyle: '',
    spiritualStyle: '',
  };

  // Process each section's responses
  Object.entries(responses).forEach(([sectionId, sectionResponses]) => {
    // Check if sectionResponses is an object (expected format)
    if (typeof sectionResponses === 'object' && !Array.isArray(sectionResponses)) {
    // Process responses for each question within the section
      Object.entries(sectionResponses).forEach(([questionId, answers]) => {
        if (Array.isArray(answers)) {
          // Process each selected answer
          answers.forEach(answer => {
            // Map the different answers to trait scores
            if (answer.includes('bold') || answer.includes('courage')) {
              profile.boldness += 1;
            }
            if (answer.includes('wise') || answer.includes('knowledge') || answer.includes('discern')) {
              profile.wisdom += 1;
            }
            if (answer.includes('help') || answer.includes('serve') || answer.includes('support')) {
              profile.service += 1;
            }
            if (answer.includes('patient') || answer.includes('wait') || answer.includes('endure')) {
              profile.patience += 1;
            }
            if (answer.includes('faith') || answer.includes('trust') || answer.includes('believe')) {
              profile.faith += 1;
            }
            if (answer.includes('lead') || answer.includes('direct') || answer.includes('guide')) {
              profile.leadership += 1;
            }
            if (answer.includes('humble') || answer.includes('modest')) {
              profile.humility += 1;
            }
            if (answer.includes('overcome') || answer.includes('persevere') || answer.includes('strength')) {
              profile.resilience += 1;
            }

            // Process custom answers for sentiment matching
            if (answer.length > 15) { // Likely a custom answer
              // Simple keyword matching for custom answers
              const lowerAnswer = answer.toLowerCase();

              const traitKeywords = {
                boldness: ['bold', 'brave', 'courage', 'fearless', 'confident', 'strong'],
                wisdom: ['wise', 'smart', 'knowledge', 'understand', 'discern', 'insight'],
                service: ['help', 'serve', 'support', 'give', 'assist', 'volunteer'],
                patience: ['patient', 'wait', 'endure', 'persevere', 'steady', 'calm'],
                faith: ['faith', 'trust', 'believe', 'hope', 'faithful', 'devoted'],
                leadership: ['lead', 'guide', 'direct', 'influence', 'inspire', 'manage'],
                humility: ['humble', 'modest', 'unassuming', 'meek', 'gentle'],
                resilience: ['resilient', 'strong', 'overcome', 'struggle', 'endure', 'adapt']
              };

              // Count keyword matches in custom answers
              Object.entries(traitKeywords).forEach(([trait, keywords]) => {
                keywords.forEach(keyword => {
                  if (lowerAnswer.includes(keyword)) {
                    profile[trait] += 0.5; // Give partial weight to custom matches
                  }
                });
              });
            }
          });
        }
      });
    } else {
      console.log(`Warning: Unexpected format for section ${sectionId}`, sectionResponses);
    }
  });

  // Determine leadership style based on traits
  if (profile.boldness > profile.wisdom) {
    profile.leadershipStyle = 'direct';
  } else if (profile.wisdom > profile.boldness) {
    profile.leadershipStyle = 'strategic';
  } else if (profile.leadership > profile.humility) {
    profile.leadershipStyle = 'influential';
  } else {
    profile.leadershipStyle = 'supportive';
  }

  // Determine spiritual style based on traits
  if (profile.service > profile.patience) {
    profile.spiritualStyle = 'active';
  } else if (profile.patience > profile.service) {
    profile.spiritualStyle = 'contemplative';
  } else if (profile.faith > profile.resilience) {
    profile.spiritualStyle = 'faithful';
  } else {
    profile.spiritualStyle = 'resilient';
  }

  return profile;
}

function matchNameMeaning(nameMeaning) {
  if (!nameMeaning || typeof nameMeaning !== 'string') return [];

  const themes = {
    leadership: ['leader', 'strong', 'mighty', 'king', 'rule', 'guide', 'authority'],
    wisdom: ['wise', 'judge', 'counsel', 'insight', 'knowledge', 'discern', 'understand'],
    faith: ['faithful', 'believer', 'trust', 'hope', 'devotion', 'dedication', 'loyal'],
    service: ['helper', 'servant', 'support', 'aid', 'assist', 'give', 'generous'],
    grace: ['blessed', 'favor', 'gift', 'mercy', 'compassion', 'kindness', 'grace'],
    courage: ['brave', 'courage', 'valor', 'warrior', 'fearless', 'bold', 'strong'],
    patience: ['patient', 'endure', 'wait', 'steadfast', 'calm', 'peaceful', 'quiet'],
    joy: ['happy', 'joy', 'delight', 'rejoice', 'gladness', 'cheerful', 'pleasant'],
    righteousness: ['righteous', 'just', 'fair', 'honest', 'integrity', 'moral', 'upright'],
    love: ['love', 'beloved', 'cherished', 'dear', 'affection', 'care', 'adore']
  };

  const nameWords = nameMeaning.toLowerCase().split(/\s+/);
  const meaningMatches = [];

  Object.entries(themes).forEach(([theme, keywords]) => {
    let matchScore = 0;
    let matchedKeywords = [];

    keywords.forEach(keyword => {
      if (nameMeaning.toLowerCase().includes(keyword)) {
        matchScore += 1;
        matchedKeywords.push(keyword);
      }

      nameWords.forEach(word => {
        if (word === keyword) {
          matchScore += 0.5;
          matchedKeywords.push(keyword);
        }
      });
    });

    if (matchScore > 0) {
      meaningMatches.push({
        theme,
        score: matchScore,
        keywords: [...new Set(matchedKeywords)]
      });
    }
  });

  return meaningMatches.sort((a, b) => b.score - a.score);
}

function findBestMatch(profile, nameThemes, userGender) {
  const matches = [];
  const verseReferences = [];

  biblicalCharacters.forEach(character => {
    let score = 0;
    let matchReasons = [];

    if (character.leadership === profile.leadershipStyle) {
      score += 2;
      matchReasons.push(`leadership style (${profile.leadershipStyle})`);
    }

    if (character.spiritualStyle === profile.spiritualStyle) {
      score += 2;
      matchReasons.push(`spiritual approach (${profile.spiritualStyle})`);
    }

    nameThemes.forEach(themeMatch => {
      if (character.nameThemes?.includes(themeMatch.theme)) {
        score += themeMatch.score * 2;
        matchReasons.push(`name theme (${themeMatch.theme})`);
      }
    });

    const traits = ['boldness', 'wisdom', 'service', 'patience', 'faith', 'leadership', 'humility', 'resilience'];

    traits.forEach(trait => {
      if (profile[trait] > 0 && character.traits.includes(trait)) {
        const traitScore = Math.min(profile[trait] * 0.5, 2);
        score += traitScore;
        matchReasons.push(trait);
      }
    });

    if (userGender && character.gender === userGender) {
      score += 1;
      matchReasons.push('gender match');
    }

    matches.push({
      character,
      score,
      matchReasons,
      explanation: `${character.name} matches your profile in: ${matchReasons.join(', ')}.`
    });
  });

  matches.sort((a, b) => b.score - a.score);

  const primaryMatch = matches[0];

  const dominantTraits = Object.entries(profile)
    .filter(([key]) => ['boldness', 'wisdom', 'service', 'patience', 'faith', 'leadership', 'humility', 'resilience'].includes(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([trait]) => trait);

  const verseMap = {
    boldness: ["Joshua 1:9", "2 Timothy 1:7", "Deuteronomy 31:6"],
    wisdom: ["Proverbs 3:13", "James 1:5", "Ecclesiastes 7:12"],
    service: ["Galatians 5:13", "Mark 10:45", "Matthew 23:11"],
    patience: ["James 1:12", "Romans 5:3", "Psalm 27:14"],
    faith: ["Hebrews 11:1", "Matthew 17:20", "Romans 10:17"],
    leadership: ["Titus 1:7-9", "1 Timothy 3:2-7", "Philippians 2:3-4"],
    humility: ["Philippians 2:3-4", "1 Peter 5:5-6", "Proverbs 11:2"],
    resilience: ["James 1:2-4", "Romans 5:3-5", "2 Corinthians 4:8-9"]
  };

  dominantTraits.forEach(trait => {
    if (verseMap[trait]) {
      verseReferences.push(...verseMap[trait]);
    }
  });

  const alternateMatches = matches.slice(1, 4).map(match => ({
    name: match.character.name,
    gender: match.character.gender,
    score: match.score / primaryMatch.score,
    traits: match.character.traits.slice(0, 3),
    explanation: match.explanation
  }));

  return {
    primaryMatch: {
      name: primaryMatch.character.name,
      gender: primaryMatch.character.gender,
      score: 1.0,
      traits: primaryMatch.character.traits,
      challenges: primaryMatch.character.challenges,
      leadership: primaryMatch.character.leadership,
      spiritualStyle: primaryMatch.character.spiritualStyle,
      verseReferences,
      explanation: `Based on your responses, you share many qualities with ${primaryMatch.character.name}. Like ${primaryMatch.character.name}, you demonstrate the following qualities: ${primaryMatch.character.traits.join(', ')}. Your approach to leadership is similar to ${primaryMatch.character.name}'s ${primaryMatch.character.leadership} leadership style and your spiritual journey can be described as ${primaryMatch.character.spiritualStyle}.`
    },
    alternateMatches,
    matchScores: {
      traits: Object.fromEntries(
        Object.entries(profile)
          .filter(([key]) => ['boldness', 'wisdom', 'service', 'patience', 'faith', 'leadership', 'humility', 'resilience'].includes(key))
      ),
      nameThemes: nameThemes.slice(0, 3)
    }
  };
}

module.exports = { calculateProfile, matchNameMeaning, findBestMatch };