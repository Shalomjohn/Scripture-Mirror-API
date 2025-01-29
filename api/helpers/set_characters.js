const BiblicalCharacter = require('../models/biblical_character');
// src/data/biblicalCharacters.js
const characters = [
    {
      name: "Daniel",
      nameMeaning: "God is my judge",
      significance: ["prophet", "wisdom", "faithfulness"],
      characteristics: ["wise", "faithful", "courageous", "devoted"],
      virtues: ["integrity", "wisdom", "courage"],
      challenges: ["persecution", "exile", "temptation"],
      story: "A Jewish exile who rose to prominence in Babylon through his wisdom and faith",
      biblicalReferences: [
        { book: "Daniel", chapter: 1, verse: 6, text: "Among these were some from Judah: Daniel, Hananiah, Mishael and Azariah." }
      ]
    },
    {
      name: "Esther",
      nameMeaning: "star",
      significance: ["queen", "deliverer", "courage"],
      characteristics: ["brave", "wise", "strategic", "faithful"],
      virtues: ["courage", "wisdom", "selflessness"],
      challenges: ["identity conflict", "life-threatening decisions"],
      story: "A Jewish queen who saved her people from destruction",
      biblicalReferences: [
        { book: "Esther", chapter: 2, verse: 7, text: "Esther, who was also known as Hadassah" }
      ]
    },
    {
      name: "David",
      nameMeaning: "beloved",
      significance: ["king", "warrior", "psalmist"],
      characteristics: ["faithful", "warrior", "passionate", "repentant"],
      virtues: ["courage", "worship", "leadership"],
      challenges: ["temptation", "family conflict", "pride"],
      story: "A shepherd who became Israel's greatest king",
      biblicalReferences: [
        { book: "1 Samuel", chapter: 16, verse: 13, text: "So Samuel took the horn of oil and anointed him" }
      ]
    },
    {
      name: "Ruth",
      nameMeaning: "friend, companion",
      significance: ["loyalty", "redemption", "humility"],
      characteristics: ["compassionate", "loyal", "hardworking", "humble"],
      virtues: ["dedication", "love", "faithfulness"],
      challenges: ["widowhood", "poverty", "cultural barriers"],
      story: "A Moabite woman who showed extraordinary loyalty to her mother-in-law and became an ancestor of King David",
      biblicalReferences: [
        { book: "Ruth", chapter: 1, verse: 16, text: "Where you go I will go, and where you stay I will stay" }
      ]
    },
    {
      name: "Joseph",
      nameMeaning: "he will add",
      significance: ["dreamer", "leader", "forgiveness"],
      characteristics: ["resilient", "wise", "forgiving", "strategic"],
      virtues: ["patience", "integrity", "compassion"],
      challenges: ["betrayal", "slavery", "false accusation"],
      story: "Sold by his brothers, became a powerful leader in Egypt and ultimately saved his family",
      biblicalReferences: [
        { book: "Genesis", chapter: 37, verse: 5, text: "Joseph had a dream, and when he told it to his brothers" }
      ]
    },
    {
      name: "Mary",
      nameMeaning: "bitter or beloved",
      significance: ["mother of Jesus", "faith", "humility"],
      characteristics: ["obedient", "humble", "courageous"],
      virtues: ["faith", "surrender", "motherly love"],
      challenges: ["social stigma", "incredible responsibility"],
      story: "The mother of Jesus, who accepted God's extraordinary calling with faith and humility",
      biblicalReferences: [
        { book: "Luke", chapter: 1, verse: 38, text: "'I am the Lord's servant,' Mary answered" }
      ]
    },
    {
      name: "Paul",
      nameMeaning: "small or humble",
      significance: ["apostle", "missionary", "theologian"],
      characteristics: ["passionate", "intellectual", "transformative"],
      virtues: ["dedication", "perseverance", "teaching"],
      challenges: ["persecution", "physical suffering", "theological debates"],
      story: "A former persecutor of Christians who became a key spreader of the Christian message",
      biblicalReferences: [
        { book: "Acts", chapter: 9, verse: 3, text: "As he neared Damascus on his journey" }
      ]
    },
    {
      name: "Solomon",
      nameMeaning: "peace",
      significance: ["king", "wise man", "builder"],
      characteristics: ["intelligent", "wealthy", "complex"],
      virtues: ["wisdom", "understanding", "leadership"],
      challenges: ["temptation", "idolatry", "complexity of ruling"],
      story: "Known for his extraordinary wisdom, he built the first temple and wrote much of Proverbs",
      biblicalReferences: [
        { book: "1 Kings", chapter: 3, verse: 9, text: "Give your servant a discerning heart to govern" }
      ]
    },
    {
      name: "Deborah",
      nameMeaning: "bee or wasp",
      significance: ["prophetess", "judge", "leader"],
      characteristics: ["brave", "strategic", "spiritual"],
      virtues: ["courage", "leadership", "wisdom"],
      challenges: ["leading in a patriarchal society", "military conflict"],
      story: "A rare female judge who led Israel to military victory",
      biblicalReferences: [
        { book: "Judges", chapter: 4, verse: 4, text: "Deborah, a prophetess, was leading Israel" }
      ]
    },
    {
      name: "Nehemiah",
      nameMeaning: "comfort of God",
      significance: ["leader", "rebuilder", "reformer"],
      characteristics: ["determined", "strategic", "compassionate"],
      virtues: ["leadership", "prayer", "restoration"],
      challenges: ["opposition", "complex political environment"],
      story: "Rebuilt Jerusalem's walls despite significant external opposition",
      biblicalReferences: [
        { book: "Nehemiah", chapter: 1, verse: 4, text: "When I heard these things, I sat down and wept" }
      ]
    },{
      name: "Moses",
      nameMeaning: "drawn out",
      significance: ["prophet", "leader", "lawgiver"],
      characteristics: ["courageous", "humble", "persistent"],
      virtues: ["faith", "obedience", "compassion"],
      challenges: ["self-doubt", "leadership", "spiritual rebellion"],
      story: "Led the Israelites out of Egyptian slavery and received the Ten Commandments",
      biblicalReferences: [
        { book: "Exodus", chapter: 3, verse: 10, text: "So now, go. I am sending you to Pharaoh to bring my people out of Egypt." }
      ]
    },
    {
      name: "Joshua",
      nameMeaning: "Yahweh is salvation",
      significance: ["military leader", "conqueror", "faithful servant"],
      characteristics: ["brave", "strategic", "loyal"],
      virtues: ["courage", "leadership", "trust in God"],
      challenges: ["conquest", "maintaining unity"],
      story: "Led the Israelites into the Promised Land after Moses",
      biblicalReferences: [
        { book: "Joshua", chapter: 1, verse: 9, text: "Be strong and courageous. Do not be afraid." }
      ]
    },
    {
      name: "Samuel",
      nameMeaning: "God has heard",
      significance: ["prophet", "judge", "spiritual leader"],
      characteristics: ["discerning", "spiritual", "obedient"],
      virtues: ["listening", "guidance", "integrity"],
      challenges: ["family dysfunction", "leadership transition"],
      story: "Last of the judges and first of the prophets who anointed Israel's first kings",
      biblicalReferences: [
        { book: "1 Samuel", chapter: 3, verse: 10, text: "Speak, for your servant is listening." }
      ]
    },
    {
      name: "Samson",
      nameMeaning: "brightness",
      significance: ["judge", "strong man", "nazarite"],
      characteristics: ["powerful", "passionate", "flawed"],
      virtues: ["strength", "deliverance"],
      challenges: ["temptation", "personal weakness", "pride"],
      story: "Legendary strongman who fought against Philistine oppression",
      biblicalReferences: [
        { book: "Judges", chapter: 16, verse: 28, text: "Sovereign Lord, remember me." }
      ]
    },
    {
      name: "Abraham",
      nameMeaning: "father of many",
      significance: ["patriarch", "faith pioneer", "covenant bearer"],
      characteristics: ["faithful", "obedient", "adventurous"],
      virtues: ["trust", "hospitality", "sacrifice"],
      challenges: ["childlessness", "faith tests", "cultural transitions"],
      story: "Father of Isaac and considered the first patriarch of monotheistic faith",
      biblicalReferences: [
        { book: "Genesis", chapter: 12, verse: 1, text: "Leave your country, your people and your father's household" }
      ]
    },
    {
      name: "Jacob",
      nameMeaning: "supplanter",
      significance: ["patriarch", "Israel's namesake", "transformative"],
      characteristics: ["strategic", "persistent", "complex"],
      virtues: ["determination", "spiritual growth", "reconciliation"],
      challenges: ["family conflicts", "personal transformation"],
      story: "Wrestled with God, received the name Israel, father of twelve tribal leaders",
      biblicalReferences: [
        { book: "Genesis", chapter: 32, verse: 28, text: "Your name shall no longer be Jacob, but Israel" }
      ]
    },
    {
      name: "Elijah",
      nameMeaning: "my God is Yahweh",
      significance: ["prophet", "miracle worker", "spiritual warrior"],
      characteristics: ["bold", "confrontational", "passionate"],
      virtues: ["faith", "courage", "spiritual authenticity"],
      challenges: ["persecution", "spiritual loneliness"],
      story: "Confronted false prophets and performed miraculous signs",
      biblicalReferences: [
        { book: "1 Kings", chapter: 18, verse: 27, text: "Surely he is a god! Perhaps he is deep in thought" }
      ]
    },
    {
      name: "Isaiah",
      nameMeaning: "salvation of Yahweh",
      significance: ["prophet", "messianic predictor", "spiritual advisor"],
      characteristics: ["articulate", "prophetic", "visionary"],
      virtues: ["spiritual insight", "hope", "redemption message"],
      challenges: ["unpopular prophecies", "national crisis"],
      story: "Major prophet who predicted the coming of the Messiah",
      biblicalReferences: [
        { book: "Isaiah", chapter: 6, verse: 8, text: "Here I am. Send me!" }
      ]
    },
    {
      name: "Noah",
      nameMeaning: "rest",
      significance: ["righteous man", "ark builder", "survivor"],
      characteristics: ["obedient", "patient", "faithful"],
      virtues: ["trust", "preservation", "hope"],
      challenges: ["global judgment", "societal mockery"],
      story: "Built an ark to preserve life during a global flood",
      biblicalReferences: [
        { book: "Genesis", chapter: 6, verse: 9, text: "Noah was a righteous man, blameless among the people of his time" }
      ]
    },
    {
      name: "Jonah",
      nameMeaning: "dove",
      significance: ["reluctant prophet", "mercy messenger"],
      characteristics: ["resistant", "transformative", "humorous"],
      virtues: ["eventual obedience", "divine perspective"],
      challenges: ["prejudice", "personal comfort", "mission resistance"],
      story: "Swallowed by a great fish after trying to avoid God's mission",
      biblicalReferences: [
        { book: "Jonah", chapter: 1, verse: 3, text: "But Jonah ran away from the Lord" }
      ]
    },{
      name: "Peter",
      nameMeaning: "rock",
      significance: ["apostle", "church leader", "disciple"],
      characteristics: ["impulsive", "passionate", "transformative"],
      virtues: ["courage", "leadership", "repentance"],
      challenges: ["denial", "faith fluctuations", "cultural barriers"],
      story: "Fisherman turned key apostle who helped establish the early Christian church"
    },
    {
      name: "Timothy",
      nameMeaning: "honoring God",
      significance: ["pastor", "missionary", "mentee"],
      characteristics: ["young", "dedicated", "teachable"],
      virtues: ["loyalty", "spiritual growth", "service"],
      challenges: ["youth", "leadership development", "health issues"],
      story: "Young protégé of Paul who became a significant church leader"
    },
    {
      name: "Jeremiah",
      nameMeaning: "God will uplift",
      significance: ["prophet", "weeping prophet", "social critic"],
      characteristics: ["emotional", "persistent", "prophetic"],
      virtues: ["truth-telling", "spiritual sensitivity", "courage"],
      challenges: ["persecution", "national decline", "emotional burden"],
      story: "Prophesied Jerusalem's destruction and Israel's spiritual restoration"
    },
    {
      name: "Lydia",
      nameMeaning: "from Lydia",
      significance: ["businesswoman", "first European convert", "church supporter"],
      characteristics: ["entrepreneurial", "hospitable", "spiritually responsive"],
      virtues: ["generosity", "faith", "leadership"],
      challenges: ["female leadership", "cultural constraints"],
      story: "Successful merchant who became a key supporter of early Christian ministry"
    },
    {
      name: "Gideon",
      nameMeaning: "feller",
      significance: ["judge", "military leader", "faith warrior"],
      characteristics: ["hesitant", "strategic", "transformative"],
      virtues: ["obedience", "courage", "trust"],
      challenges: ["self-doubt", "military underdog", "spiritual testing"],
      story: "Defeated a massive army with just 300 men through divine strategy"
    },
    {
      name: "John the Baptist",
      nameMeaning: "Yahweh is gracious",
      significance: ["prophet", "messenger", "baptizer"],
      characteristics: ["radical", "direct", "prophetic"],
      virtues: ["truth", "preparation", "spiritual integrity"],
      challenges: ["societal criticism", "persecution", "martyrdom"],
      story: "Prepared the way for Jesus, baptized him, and challenged societal norms"
    },
    {
      name: "Priscilla",
      nameMeaning: "ancient",
      significance: ["teacher", "missionary", "church leader"],
      characteristics: ["educated", "influential", "collaborative"],
      virtues: ["wisdom", "teaching", "hospitality"],
      challenges: ["female leadership", "cultural limitations"],
      story: "Worked with her husband Aquila to teach and support early Christian missions"
    },
    {
      name: "Ezra",
      nameMeaning: "helper",
      significance: ["scribe", "religious reformer", "spiritual leader"],
      characteristics: ["scholarly", "disciplined", "restoration-focused"],
      virtues: ["knowledge", "spiritual renewal", "leadership"],
      challenges: ["cultural restoration", "spiritual rebuilding"],
      story: "Led Jewish exiles back to Jerusalem and restored religious practices"
    },
    {
      name: "Barnabas",
      nameMeaning: "son of encouragement",
      significance: ["apostle", "encourager", "missionary companion"],
      characteristics: ["supportive", "generous", "reconciler"],
      virtues: ["encouragement", "mentorship", "unity"],
      challenges: ["ministry conflicts", "cultural transitions"],
      story: "Supported Paul's early ministry and mentored young Christian leaders"
    },
    {
      name: "Naomi",
      nameMeaning: "delightful",
      significance: ["mother-in-law", "survivor", "wisdom figure"],
      characteristics: ["resilient", "loyal", "nurturing"],
      virtues: ["love", "guidance", "perseverance"],
      challenges: ["loss", "poverty", "cultural survival"],
      story: "Experienced profound loss but played a crucial role in Ruth's redemption story"
    }
    // TODO: Add more characters as needed
  ];

// Add this to your initial setup script
async function seedCharacters() {
  try {
    await BiblicalCharacter.deleteMany({});
    await BiblicalCharacter.insertMany(characters);
    console.log('Biblical characters seeded successfully');
  } catch (error) {
    console.error('Error seeding characters:', error);
  }
}

module.exports = seedCharacters;