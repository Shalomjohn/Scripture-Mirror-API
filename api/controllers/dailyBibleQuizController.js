// Add these methods to your existing authController.js

const User = require("../models/user");

// Get today's daily quiz questions
exports.getDailyQuiz = async (req, res) => {
  try {
    // Check if user already completed today's quiz
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSubmission = await User.findById(req.user._id).select('dailyQuizHistory');
    const todaySubmission = existingSubmission?.dailyQuizHistory?.find(
      entry => entry.date.toDateString() === today.toDateString()
    );

    if (todaySubmission) {
      return res.json({
        completed: true,
        score: todaySubmission.score,
        totalQuestions: todaySubmission.totalQuestions
      });
    }

    // Generate today's questions (same questions for all users on the same day)
    const questions = getDailyQuestions(today);

    res.json({
      completed: false,
      questions: questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        id: q.id
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit daily quiz answers
exports.submitDailyQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of {questionId, userAnswer}
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await User.findById(req.user._id);

    // Check if already submitted today
    const existingSubmission = user.dailyQuizHistory?.find(
      entry => entry.date.toDateString() === today.toDateString()
    );

    if (existingSubmission) {
      return res.status(400).json({ error: 'Quiz already completed today' });
    }

    // Get today's questions with correct answers
    const questions = getDailyQuestions(today);

    // Calculate score
    let score = 0;
    const results = [];

    answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question && answer.userAnswer === question.correctAnswer;
      if (isCorrect) score++;

      results.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect
      });
    });

    // Save to user's quiz history
    if (!user.dailyQuizHistory) {
      user.dailyQuizHistory = [];
    }

    user.dailyQuizHistory.push({
      date: today,
      score,
      totalQuestions: questions.length,
      results
    });

    await user.save();

    res.json({
      score,
      totalQuestions: questions.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate consistent daily questions
function getDailyQuestions(date) {
  const allQuestions = [
    {
      id: 'q1',
      questionText: "Who was the first man in the bible?",
      options: ["Eve", "Cain", "Adam", "Bathsheba"],
      correctAnswer: "Adam"
    },
    {
      id: 'q2',
      questionText: "Who built the ark?",
      options: ["Moses", "Noah", "Abraham", "David"],
      correctAnswer: "Noah"
    },
    {
      id: 'q3',
      questionText: "How many days did Jesus fast in the desert?",
      options: ["20 days", "30 days", "40 days", "50 days"],
      correctAnswer: "40 days"
    },
    {
      id: 'q4',
      questionText: "Who was thrown into the lions' den?",
      options: ["Daniel", "Joseph", "Paul", "Peter"],
      correctAnswer: "Daniel"
    },
    {
      id: 'q5',
      questionText: "How many disciples did Jesus choose?",
      options: ["10", "12", "14", "16"],
      correctAnswer: "12"
    },
    {
      id: 'q6',
      questionText: "In which city was Jesus born?",
      options: ["Nazareth", "Jerusalem", "Bethlehem", "Capernaum"],
      correctAnswer: "Bethlehem"
    },
    {
      id: 'q7',
      questionText: "Who betrayed Jesus?",
      options: ["Peter", "John", "Judas", "Thomas"],
      correctAnswer: "Judas"
    },
    {
      id: 'q8',
      questionText: "What did Solomon ask God for?",
      options: ["Wealth", "Long life", "Wisdom", "Power"],
      correctAnswer: "Wisdom"
    },
    {
      id: 'q9',
      questionText: "How many stones did David take to fight Goliath?",
      options: ["3", "5", "7", "10"],
      correctAnswer: "5"
    },
    {
      id: 'q10',
      questionText: "What happened to Lot's wife when she looked back?",
      options: ["She disappeared", "She turned to salt", "She was blinded", "She fell down"],
      correctAnswer: "She turned to salt"
    },
    {
      id: 'q11',
      questionText: "Who interpreted Pharaoh's dreams in Egypt?",
      options: ["Moses", "Joseph", "Aaron", "Benjamin"],
      correctAnswer: "Joseph"
    },
    {
      id: 'q12',
      questionText: "How many plagues were sent to Egypt?",
      options: ["7", "10", "12", "15"],
      correctAnswer: "10"
    },
    {
      id: 'q13',
      questionText: "What is the shortest verse in the Bible?",
      options: ["God is love", "Jesus wept", "Be still", "Pray always"],
      correctAnswer: "Jesus wept"
    },
    {
      id: 'q14',
      questionText: "Who was swallowed by a great fish?",
      options: ["Jonah", "Job", "Joshua", "Jeremiah"],
      correctAnswer: "Jonah"
    },
    {
      id: 'q15',
      questionText: "How many books are in the New Testament?",
      options: ["25", "27", "29", "31"],
      correctAnswer: "27"
    },

    {
      id: 'q16',
      questionText: "Who was the mother of Jesus?",
      options: ["Martha", "Mary", "Elizabeth", "Ruth"],
      correctAnswer: "Mary"
    },
    {
      id: 'q17',
      questionText: "What was the name of Abraham's wife?",
      options: ["Sarah", "Rebecca", "Rachel", "Leah"],
      correctAnswer: "Sarah"
    },
    {
      id: 'q18',
      questionText: "How many books are in the Old Testament?",
      options: ["37", "39", "41", "43"],
      correctAnswer: "39"
    },
    {
      id: 'q19',
      questionText: "Who was the strongest man in the Bible?",
      options: ["David", "Goliath", "Samson", "Joshua"],
      correctAnswer: "Samson"
    },
    {
      id: 'q20',
      questionText: "What did Jesus turn water into at the wedding?",
      options: ["Oil", "Wine", "Milk", "Honey"],
      correctAnswer: "Wine"
    },
    {
      id: 'q21',
      questionText: "Who was the first king of Israel?",
      options: ["David", "Solomon", "Saul", "Samuel"],
      correctAnswer: "Saul"
    },
    {
      id: 'q22',
      questionText: "How many years did the Israelites wander in the desert?",
      options: ["30", "40", "50", "60"],
      correctAnswer: "40"
    },
    {
      id: 'q23',
      questionText: "Who was Moses' brother?",
      options: ["Joshua", "Aaron", "Caleb", "Miriam"],
      correctAnswer: "Aaron"
    },
    {
      id: 'q24',
      questionText: "What did God create on the first day?",
      options: ["Animals", "Plants", "Light", "Man"],
      correctAnswer: "Light"
    },
    {
      id: 'q25',
      questionText: "Who climbed a sycamore tree to see Jesus?",
      options: ["Matthew", "Zacchaeus", "Nicodemus", "Bartimaeus"],
      correctAnswer: "Zacchaeus"
    },
    {
      id: 'q26',
      questionText: "What was Paul's name before he became a Christian?",
      options: ["Simon", "Saul", "Stephen", "Samuel"],
      correctAnswer: "Saul"
    },
    {
      id: 'q27',
      questionText: "Who was known as the 'beloved disciple'?",
      options: ["Peter", "James", "John", "Andrew"],
      correctAnswer: "John"
    },
    {
      id: 'q28',
      questionText: "How many people were saved in Noah's ark?",
      options: ["6", "8", "10", "12"],
      correctAnswer: "8"
    },
    {
      id: 'q29',
      questionText: "Who was the wisest king in the Bible?",
      options: ["David", "Solomon", "Hezekiah", "Josiah"],
      correctAnswer: "Solomon"
    },
    {
      id: 'q30',
      questionText: "What did John the Baptist eat in the wilderness?",
      options: ["Fish and bread", "Locusts and honey", "Fruits and nuts", "Manna and quail"],
      correctAnswer: "Locusts and honey"
    },
    {
      id: 'q31',
      questionText: "Who was the first martyr in the New Testament?",
      options: ["James", "Stephen", "John", "Peter"],
      correctAnswer: "Stephen"
    },
    {
      id: 'q32',
      questionText: "How many days was Lazarus dead before Jesus raised him?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "4"
    },
    {
      id: 'q33',
      questionText: "Who was the judge who defeated the Midianites with 300 men?",
      options: ["Samson", "Gideon", "Jephthah", "Deborah"],
      correctAnswer: "Gideon"
    },
    {
      id: 'q34',
      questionText: "What was the name of the mountain where Moses received the Ten Commandments?",
      options: ["Mount Carmel", "Mount Sinai", "Mount Olive", "Mount Ararat"],
      correctAnswer: "Mount Sinai"
    },
    {
      id: 'q35',
      questionText: "Who was the tax collector that Jesus called to follow him?",
      options: ["Matthew", "Luke", "Mark", "Zacchaeus"],
      correctAnswer: "Matthew"
    },
    {
      id: 'q36',
      questionText: "How many sons did Jacob have?",
      options: ["10", "12", "14", "16"],
      correctAnswer: "12"
    },
    {
      id: 'q37',
      questionText: "Who was the prophetess who sang after the Red Sea crossing?",
      options: ["Deborah", "Miriam", "Hannah", "Esther"],
      correctAnswer: "Miriam"
    },
    {
      id: 'q38',
      questionText: "What was the first miracle Jesus performed?",
      options: ["Healing the blind", "Walking on water", "Turning water to wine", "Feeding 5000"],
      correctAnswer: "Turning water to wine"
    },
    {
      id: 'q39',
      questionText: "Who replaced Judas as the 12th apostle?",
      options: ["Paul", "Barnabas", "Matthias", "Timothy"],
      correctAnswer: "Matthias"
    },
    {
      id: 'q40',
      questionText: "What did the dove bring back to Noah?",
      options: ["A twig", "An olive leaf", "A flower", "A seed"],
      correctAnswer: "An olive leaf"
    },
    {
      id: 'q41',
      questionText: "Who was thrown into a fiery furnace?",
      options: ["Daniel", "Shadrach, Meshach, and Abednego", "Jeremiah", "Ezekiel"],
      correctAnswer: "Shadrach, Meshach, and Abednego"
    },
    {
      id: 'q42',
      questionText: "What language was the New Testament originally written in?",
      options: ["Hebrew", "Aramaic", "Greek", "Latin"],
      correctAnswer: "Greek"
    },
    {
      id: 'q43',
      questionText: "Who was the queen that saved the Jewish people?",
      options: ["Ruth", "Esther", "Bathsheba", "Jezebel"],
      correctAnswer: "Esther"
    },
    {
      id: 'q44',
      questionText: "How many times did Peter deny Jesus?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "3"
    },
    {
      id: 'q45',
      questionText: "What was the name of the garden where Adam and Eve lived?",
      options: ["Garden of Gethsemane", "Garden of Eden", "Garden of Olives", "Garden of Peace"],
      correctAnswer: "Garden of Eden"
    },
    {
      id: 'q46',
      questionText: "Who was the oldest man in the Bible?",
      options: ["Adam", "Noah", "Methuselah", "Abraham"],
      correctAnswer: "Methuselah"
    },
    {
      id: 'q47',
      questionText: "What did Jesus say is the greatest commandment?",
      options: ["Do not kill", "Honor your parents", "Love God with all your heart", "Do not steal"],
      correctAnswer: "Love God with all your heart"
    },
    {
      id: 'q48',
      questionText: "Who was the Moabite woman who became David's great-grandmother?",
      options: ["Ruth", "Naomi", "Orpah", "Tamar"],
      correctAnswer: "Ruth"
    },
    {
      id: 'q49',
      questionText: "How many loaves and fish did Jesus use to feed the 5000?",
      options: ["3 loaves, 2 fish", "5 loaves, 2 fish", "7 loaves, 3 fish", "2 loaves, 5 fish"],
      correctAnswer: "5 loaves, 2 fish"
    },
    {
      id: 'q50',
      questionText: "Who was the prophet that was taken up to heaven in a whirlwind?",
      options: ["Elijah", "Elisha", "Isaiah", "Jeremiah"],
      correctAnswer: "Elijah"
    },
    {
      id: 'q51',
      questionText: "What was the name of the place where Jesus was crucified?",
      options: ["Mount Sinai", "Golgotha", "Mount Olive", "Bethany"],
      correctAnswer: "Golgotha"
    },
    {
      id: 'q52',
      questionText: "Who was the Roman centurion whose servant Jesus healed?",
      options: ["Cornelius", "Julius", "Centurion", "The centurion is unnamed"],
      correctAnswer: "The centurion is unnamed"
    },
    {
      id: 'q53',
      questionText: "How many years did Sarah live?",
      options: ["120", "127", "130", "137"],
      correctAnswer: "127"
    },
    {
      id: 'q54',
      questionText: "Who was the prophet that confronted King David about his sin with Bathsheba?",
      options: ["Samuel", "Nathan", "Gad", "Elijah"],
      correctAnswer: "Nathan"
    },
    {
      id: 'q55',
      questionText: "What was the name of Isaac's wife?",
      options: ["Sarah", "Rebecca", "Rachel", "Leah"],
      correctAnswer: "Rebecca"
    },
    {
      id: 'q56',
      questionText: "How many chapters are in the book of Psalms?",
      options: ["147", "148", "149", "150"],
      correctAnswer: "150"
    },
    {
      id: 'q57',
      questionText: "Who was the first person to see Jesus after his resurrection?",
      options: ["Peter", "John", "Mary Magdalene", "The other Mary"],
      correctAnswer: "Mary Magdalene"
    },
    {
      id: 'q58',
      questionText: "What did Moses' rod turn into when he threw it down?",
      options: ["A fish", "A snake", "A bird", "A flower"],
      correctAnswer: "A snake"
    },
    {
      id: 'q59',
      questionText: "Who was the king of Salem who blessed Abraham?",
      options: ["Melchizedek", "Abimelech", "Pharaoh", "Nebuchadnezzar"],
      correctAnswer: "Melchizedek"
    },
    {
      id: 'q60',
      questionText: "How many days and nights did it rain during the flood?",
      options: ["30", "40", "50", "60"],
      correctAnswer: "40"
    },
    {
      id: 'q61',
      questionText: "Who was the young man who fell asleep during Paul's sermon and fell from a window?",
      options: ["Timothy", "Titus", "Eutychus", "Silas"],
      correctAnswer: "Eutychus"
    },
    {
      id: 'q62',
      questionText: "What was the name of Abraham's first son?",
      options: ["Isaac", "Ishmael", "Jacob", "Esau"],
      correctAnswer: "Ishmael"
    },
    {
      id: 'q63',
      questionText: "Who was the judge who made a rash vow concerning his daughter?",
      options: ["Gideon", "Samson", "Jephthah", "Ehud"],
      correctAnswer: "Jephthah"
    },
    {
      id: 'q64',
      questionText: "What was the name of the field Judas bought with his betrayal money?",
      options: ["Field of Blood", "Potter's Field", "Akeldama", "All of these"],
      correctAnswer: "All of these"
    },
    {
      id: 'q65',
      questionText: "Who was the prophet that was told to marry an unfaithful woman?",
      options: ["Isaiah", "Jeremiah", "Hosea", "Amos"],
      correctAnswer: "Hosea"
    },
    {
      id: 'q66',
      questionText: "How many years did it take to build Solomon's temple?",
      options: ["5", "7", "10", "12"],
      correctAnswer: "7"
    },
    {
      id: 'q67',
      questionText: "Who was the evil queen who tried to kill all the prophets?",
      options: ["Athaliah", "Jezebel", "Herodias", "Gomer"],
      correctAnswer: "Jezebel"
    },
    {
      id: 'q68',
      questionText: "What did the wise men bring to baby Jesus?",
      options: ["Gold, silver, bronze", "Gold, frankincense, myrrh", "Spices, oils, perfumes", "Food, clothes, money"],
      correctAnswer: "Gold, frankincense, myrrh"
    },
    {
      id: 'q69',
      questionText: "Who was the king of Babylon who conquered Jerusalem?",
      options: ["Nebuchadnezzar", "Belshazzar", "Cyrus", "Darius"],
      correctAnswer: "Nebuchadnezzar"
    },
    {
      id: 'q70',
      questionText: "How many books did Paul write in the New Testament?",
      options: ["12", "13", "14", "15"],
      correctAnswer: "13"
    },
    {
      id: 'q71',
      questionText: "Who was the woman judge who led Israel to victory?",
      options: ["Miriam", "Deborah", "Ruth", "Esther"],
      correctAnswer: "Deborah"
    },
    {
      id: 'q72',
      questionText: "What was the name of the giant that David killed?",
      options: ["Goliath", "Og", "Anak", "Lahmi"],
      correctAnswer: "Goliath"
    },
    {
      id: 'q73',
      questionText: "Who was the first high priest of Israel?",
      options: ["Moses", "Aaron", "Eli", "Samuel"],
      correctAnswer: "Aaron"
    },
    {
      id: 'q74',
      questionText: "What did Jesus write on the ground when the adulteress was brought to him?",
      options: ["Her sins", "The Ten Commandments", "The Bible doesn't say", "Forgiveness"],
      correctAnswer: "The Bible doesn't say"
    },
    {
      id: 'q75',
      questionText: "How many times did Naaman have to dip in the Jordan River to be healed?",
      options: ["5", "7", "10", "12"],
      correctAnswer: "7"
    }
  ];

  // Use date as seed for consistent daily selection
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const shuffled = shuffleWithSeed(allQuestions, seed);

  // Return 4 questions (to match your current setup)
  return shuffled.slice(0, 4);
}

function shuffleWithSeed(array, seed) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  while (currentIndex > 0) {
    seed = (seed * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((seed / 233280) * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] =
      [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}