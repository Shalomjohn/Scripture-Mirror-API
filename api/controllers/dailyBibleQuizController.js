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