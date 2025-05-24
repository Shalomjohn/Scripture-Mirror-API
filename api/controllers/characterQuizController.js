// src/controllers/quizController.js
const QuizSection = require('../models/character_quiz_section');
const QuizQuestion = require('../models/character_quiz_question');

// Get all quiz sections
exports.getQuizSections = async (req, res) => {
    try {
        const sections = await QuizSection.find().sort({ order: 1 });
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get random questions for a specific section
exports.getQuizQuestions = async (req, res) => {
    try {
        const { sectionId } = req.params;
        // Get all questions for this section
        const allQuestions = await QuizQuestion.find({ sectionId }).sort({ order: 1 });

        if (!allQuestions.length) {
            return res.status(404).json({ error: 'No questions found for this section' });
        }

        // Number of questions to return
        const questionsToReturn = 3;

        // If we have more questions than needed, randomly select some
        let selectedQuestions = allQuestions;
        if (allQuestions.length > questionsToReturn) {
            // Shuffle array to get random selection
            selectedQuestions = shuffleArray(allQuestions).slice(0, questionsToReturn);

            // Sort by order for consistent presentation
            selectedQuestions.sort((a, b) => a.order - b.order);
        }

        res.status(200).json(selectedQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Seed initial quiz sections and questions
exports.seedQuizData = async () => {
    try {
        // First check if sections exist
        const sectionCount = await QuizSection.countDocuments();
        let sectionsExist = sectionCount > 0;

        // Create quiz sections
        const sections = [
            {
                id: 'personality',
                title: 'About your personality',
                subtitle: 'Tell us about your personal traits and characteristics',
                type: 'multiple_choice',
                required: true,
                options: [
                    { label: 'Bold and courageous', value: 'Bold and courageous' },
                    { label: 'Patient and nurturing', value: 'Patient and nurturing' },
                    { label: 'Strategic and thoughtful', value: 'Strategic and thoughtful' },
                    { label: 'Humble and obedient', value: 'Humble and obedient' }
                ],
                allowCustomInput: true,
                order: 1
            },
            {
                id: 'spiritual_journey',
                title: 'Spiritual Journey',
                subtitle: 'Share your approach to faith and spiritual growth',
                type: 'multiple_choice',
                required: true,
                options: [
                    { label: 'Face challenges head-on', value: 'Face them head-on' },
                    { label: 'Reflect and pray', value: 'Reflect and pray' },
                    { label: 'Seek wise counsel', value: 'Seek wise counsel' },
                    { label: 'Trust God\'s timing', value: 'Trust God\'s timing' },
                    { label: 'Help others in need', value: 'Help others in need' }
                ],
                allowCustomInput: true,
                order: 2
            },
            {
                id: 'daily_habits',
                title: 'Daily Habits and Practices',
                subtitle: 'Describe your daily spiritual practices',
                type: 'multiple_choice',
                required: true,
                options: [
                    { label: 'Leading boldly', value: 'Leading boldly' },
                    { label: 'Studying scripture deeply', value: 'Studying scripture deeply' },
                    { label: 'Helping the needy', value: 'Helping the needy' },
                    { label: 'Being still before God', value: 'Being still before God' }
                ],
                allowCustomInput: true,
                order: 3
            },
            {
                id: 'life_challenges',
                title: 'Life Challenges',
                subtitle: 'How do you approach difficulties?',
                type: 'multiple_choice',
                required: true,
                options: [
                    { label: 'Confront it', value: 'Confront it' },
                    { label: 'Pray and reflect', value: 'Pray and reflect' },
                    { label: 'Wait patiently', value: 'Wait patiently' },
                    { label: 'Serve others while you wait', value: 'Serve others while you wait' }
                ],
                allowCustomInput: true,
                order: 4
            },
            {
                id: 'biblical_reflection',
                title: 'Biblical Reflection',
                subtitle: 'Your relationship with the Bible',
                type: 'multiple_choice',
                required: true,
                options: [
                    { label: 'I admire courage', value: 'I admire courage' },
                    { label: 'I seek understanding', value: 'I seek understanding' },
                    { label: 'I love to help', value: 'I love to help' },
                    { label: 'I\'m learning to wait', value: 'I\'m learning to wait' }
                ],
                allowCustomInput: true,
                order: 5
            }
        ];

        // Create sections if they don't exist
        if (!sectionsExist) {
            await QuizSection.insertMany(sections);
            console.log('Quiz sections seeded successfully');
        }

        // Now check for questions
        const questionCount = await QuizQuestion.countDocuments();

        // Create quiz questions - expanded set (12 questions per section)
        const questions = [
            // Personality section (1-12)
            {
                id: 'personality_q1',
                text: 'How would you describe your approach to leadership?',
                options: [
                    'I lead from the front',
                    'I prefer to guide from behind',
                    'I lead by example',
                    'I create structure and systems'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 1
            },
            {
                id: 'personality_q2',
                text: 'What are your greatest strengths?',
                options: [
                    'Courage in difficult situations',
                    'Patience with others',
                    'Strategic thinking',
                    'Loyalty and faithfulness',
                    'Service to others'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 2
            },
            {
                id: 'personality_q3',
                text: 'How do you typically respond to conflict?',
                options: [
                    'Face it directly',
                    'Seek understanding first',
                    'Try to make peace',
                    'Reflect before responding',
                    'Develop a strategic approach'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 3
            },
            {
                id: 'personality_q4',
                text: 'Which of these qualities do others most often see in you?',
                options: [
                    'Strength and determination',
                    'Wisdom and insight',
                    'Kindness and compassion',
                    'Reliability and consistency',
                    'Creativity and inspiration'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 4
            },
            {
                id: 'personality_q5',
                text: 'How do you typically make important decisions?',
                options: [
                    'Follow my intuition',
                    'Analyze all the facts',
                    'Seek advice from others',
                    'Consider what\'s best for everyone',
                    'Pray and wait for guidance'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 5
            },
            {
                id: 'personality_q6',
                text: 'When facing a new challenge, what is your first instinct?',
                options: [
                    'Take charge and lead the way',
                    'Analyze the situation carefully',
                    'Find people who can help',
                    'Wait and see how things develop',
                    'Look for creative solutions'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 6
            },
            {
                id: 'personality_q7',
                text: 'What quality do people most often seek you out for?',
                options: [
                    'Your courage in difficult situations',
                    'Your wisdom and good judgment',
                    'Your willingness to help and serve',
                    'Your patient listening ear',
                    'Your faithful reliability'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 7
            },
            {
                id: 'personality_q8',
                text: 'When working in a team, you naturally:',
                options: [
                    'Take charge and lead the group',
                    'Provide strategic insight and direction',
                    'Support others and help where needed',
                    'Keep everyone calm and steady',
                    'Inspire others through your example'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 8
            },
            {
                id: 'personality_q9',
                text: 'How do you handle situations where you need to be humble?',
                options: [
                    'I struggle with being humble naturally',
                    'I try to be modest about my achievements',
                    'I focus on serving others instead of myself',
                    'I listen more than I speak',
                    'I acknowledge my need for wisdom from others'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 9
            },
            {
                id: 'personality_q10',
                text: 'What helps you overcome personal struggles?',
                options: [
                    'My inner strength and resilience',
                    'Seeking wise counsel and knowledge',
                    'The support and help of others',
                    'Patient endurance and waiting',
                    'Faith and trust in God\'s plan'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 10
            },
            {
                id: 'personality_q11',
                text: 'In stressful situations, others would describe you as:',
                options: [
                    'Bold and fearless',
                    'Calm and discerning',
                    'Helpful and supportive',
                    'Steady and patient',
                    'Strong and resilient'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 11
            },
            {
                id: 'personality_q12',
                text: 'What drives your desire to influence others?',
                options: [
                    'To inspire courage and confidence',
                    'To share wisdom and understanding',
                    'To serve and assist them better',
                    'To help them wait for the right timing',
                    'To guide them in faithful living'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'personality',
                order: 12
            },

            // Spiritual Journey section (1-12)
            {
                id: 'spiritual_journey_q1',
                text: 'What aspect of your spiritual journey is most important to you?',
                options: [
                    'Growing in wisdom and knowledge',
                    'Developing deeper faith',
                    'Serving others better',
                    'Finding inner peace',
                    'Building meaningful relationships'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 1
            },
            {
                id: 'spiritual_journey_q2',
                text: 'When you face spiritual challenges, you usually:',
                options: [
                    'Seek wisdom in scripture',
                    'Pray for guidance',
                    'Talk with trusted mentors',
                    'Take time to reflect',
                    'Act immediately on your convictions'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 2
            },
            {
                id: 'spiritual_journey_q3',
                text: 'What spiritual qualities do you most admire in others?',
                options: [
                    'Bold faith',
                    'Wisdom and discernment',
                    'Servant\'s heart',
                    'Patient endurance',
                    'Joyful attitude'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 3
            },
            {
                id: 'spiritual_journey_q4',
                text: 'What aspect of your faith would you like to develop more?',
                options: [
                    'Deeper knowledge of scripture',
                    'More consistent prayer life',
                    'Greater faith during challenges',
                    'Stronger community connections',
                    'More active service to others'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 4
            },
            {
                id: 'spiritual_journey_q5',
                text: 'When have you felt closest to God?',
                options: [
                    'During prayer or meditation',
                    'While serving others',
                    'In times of hardship',
                    'During worship',
                    'In nature or quiet moments'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 5
            },
            {
                id: 'spiritual_journey_q6',
                text: 'What drives your spiritual growth most?',
                options: [
                    'Desire to know God better',
                    'Seeking answers to life questions',
                    'Wanting to help others effectively',
                    'Personal struggles and challenges',
                    'Community and relationships'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 6
            },
            {
                id: 'spiritual_journey_q7',
                text: 'What aspect of spiritual growth excites you most?',
                options: [
                    'Developing bold faith for challenges',
                    'Gaining deeper wisdom and insight',
                    'Finding new ways to serve others',
                    'Learning patience in God\'s timing',
                    'Building unshakeable trust in God'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 7
            },
            {
                id: 'spiritual_journey_q8',
                text: 'How do you prefer to lead others spiritually?',
                options: [
                    'By direct example and courage',
                    'Through strategic teaching and guidance',
                    'By humble service and support',
                    'Through patient mentoring',
                    'By inspiring faith and hope'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 8
            },
            {
                id: 'spiritual_journey_q9',
                text: 'What spiritual discipline helps you stay resilient?',
                options: [
                    'Bold prayer and declaration',
                    'Study and pursuit of knowledge',
                    'Acts of service and giving',
                    'Quiet waiting and meditation',
                    'Regular confession of faith'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 9
            },
            {
                id: 'spiritual_journey_q10',
                text: 'How do you maintain humility in your spiritual journey?',
                options: [
                    'I remind myself that courage comes from God',
                    'I acknowledge how much I still need to understand',
                    'I focus on serving rather than being served',
                    'I practice patient listening to God and others',
                    'I remember my complete dependence on faith'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 10
            },
            {
                id: 'spiritual_journey_q11',
                text: 'What helps you overcome spiritual struggles?',
                options: [
                    'Taking bold action in faith',
                    'Seeking wise spiritual counsel',
                    'Serving others in their struggles',
                    'Patient endurance and perseverance',
                    'Clinging to faithful promises'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 11
            },
            {
                id: 'spiritual_journey_q12',
                text: 'How do you want to influence others spiritually?',
                options: [
                    'By inspiring fearless faith',
                    'By sharing insights and understanding',
                    'By demonstrating servant leadership',
                    'By modeling steady perseverance',
                    'By encouraging trust in God\'s goodness'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'spiritual_journey',
                order: 12
            },

            // Daily Habits section (1-12)
            {
                id: 'daily_habits_q1',
                text: 'What spiritual practices are part of your regular routine?',
                options: [
                    'Scripture reading',
                    'Prayer and meditation',
                    'Serving others',
                    'Worship',
                    'Fellowship with believers'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 1
            },
            {
                id: 'daily_habits_q2',
                text: 'How do you prefer to learn spiritual truths?',
                options: [
                    'Reading and studying',
                    'Discussion with others',
                    'Practical application',
                    'Quiet reflection',
                    'Teaching others'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 2
            },
            {
                id: 'daily_habits_q3',
                text: 'What motivates your daily spiritual practices?',
                options: [
                    'Desire for wisdom',
                    'Seeking peace',
                    'Building relationship with God',
                    'Helping others',
                    'Overcoming challenges'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 3
            },
            {
                id: 'daily_habits_q4',
                text: 'What spiritual disciplines are most challenging for you?',
                options: [
                    'Consistent prayer',
                    'Regular Bible study',
                    'Fasting',
                    'Tithing/giving',
                    'Sabbath/rest'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 4
            },
            {
                id: 'daily_habits_q5',
                text: 'How do you prefer to worship?',
                options: [
                    'Through music and singing',
                    'Through prayer and meditation',
                    'Through service to others',
                    'Through study and learning',
                    'Through creativity and arts'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 5
            },
            {
                id: 'daily_habits_q6',
                text: 'What time of day do you feel most spiritually connected?',
                options: [
                    'Early morning',
                    'During the day amid activities',
                    'Evening/night in quiet',
                    'During dedicated worship times',
                    'Unexpected moments throughout the day'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 6
            },
            {
                id: 'daily_habits_q7',
                text: 'How do you approach your daily spiritual practices?',
                options: [
                    'With bold commitment and courage',
                    'Seeking wisdom for each day',
                    'Looking for ways to serve and help',
                    'With patient consistency',
                    'Trusting God to strengthen my faith'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 7
            },
            {
                id: 'daily_habits_q8',
                text: 'What leadership role do you take in your spiritual community?',
                options: [
                    'I boldly encourage others to step out in faith',
                    'I provide guidance and wise direction',
                    'I focus on supporting and helping others',
                    'I help people wait patiently on God',
                    'I inspire others through faithful example'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 8
            },
            {
                id: 'daily_habits_q9',
                text: 'How do you stay resilient in your daily spiritual walk?',
                options: [
                    'By courageously facing each challenge',
                    'Through constant learning and understanding',
                    'By serving others even when it\'s hard',
                    'Through patient endurance of difficulties',
                    'By maintaining unwavering faith and trust'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 9
            },
            {
                id: 'daily_habits_q10',
                text: 'What keeps you humble in your daily spiritual practices?',
                options: [
                    'Remembering that my strength comes from God',
                    'Recognizing how much more I need to learn',
                    'Focusing on serving rather than being recognized',
                    'Being patient with my own spiritual growth',
                    'Acknowledging my complete dependence on faith'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 10
            },
            {
                id: 'daily_habits_q11',
                text: 'How do you overcome challenges in maintaining spiritual disciplines?',
                options: [
                    'I boldly recommit to my practices',
                    'I seek wise strategies and understanding',
                    'I ask others for help and support',
                    'I patiently work to rebuild the habit',
                    'I trust that God will strengthen my resolve'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 11
            },
            {
                id: 'daily_habits_q12',
                text: 'How do you hope to influence others through your daily spiritual habits?',
                options: [
                    'By demonstrating courageous commitment',
                    'By sharing insights I\'ve gained',
                    'By offering help and support to others',
                    'By showing the value of patient consistency',
                    'By inspiring faith through faithful practice'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'daily_habits',
                order: 12
            },

            // Life Challenges section (1-12)
            {
                id: 'life_challenges_q1',
                text: 'What type of challenges have shaped you the most?',
                options: [
                    'Personal hardships',
                    'Relational conflicts',
                    'Leadership responsibilities',
                    'Waiting for promises',
                    'Moral decisions'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 1
            },
            {
                id: 'life_challenges_q2',
                text: 'What helps you persevere through difficult times?',
                options: [
                    'Faith in God\'s promises',
                    'Support from others',
                    'Inner strength',
                    'Strategic planning',
                    'Prayer and reflection'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 2
            },
            {
                id: 'life_challenges_q3',
                text: 'How do you view the purpose of challenges in your life?',
                options: [
                    'To build character',
                    'To increase wisdom',
                    'To deepen faith',
                    'To help relate to others',
                    'To prepare for greater purpose'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 3
            },
            {
                id: 'life_challenges_q4',
                text: 'What gives you strength during difficult times?',
                options: [
                    'Prayer and faith',
                    'Support from loved ones',
                    'Remembering past victories',
                    'Hope for the future',
                    'Finding deeper meaning in struggles'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 4
            },
            {
                id: 'life_challenges_q5',
                text: 'How has your faith been tested in your life?',
                options: [
                    'Through personal loss',
                    'Through unanswered prayers',
                    'Through doubt or questioning',
                    'Through opposition from others',
                    'Through waiting for promises'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 5
            },
            {
                id: 'life_challenges_q6',
                text: 'When facing an impossible situation, what is your first response?',
                options: [
                    'Take immediate action',
                    'Pray before doing anything',
                    'Seek wise counsel',
                    'Research all options',
                    'Wait for clarity before proceeding'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 6
            },
            {
                id: 'life_challenges_q7',
                text: 'What gives you courage to face difficult circumstances?',
                options: [
                    'My bold determination and inner strength',
                    'The wisdom I\'ve gained from past experiences',
                    'The support and help of those who serve me',
                    'My ability to wait patiently for resolution',
                    'My faith and trust in God\'s faithful promises'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 7
            },
            {
                id: 'life_challenges_q8',
                text: 'How do you lead others through challenging times?',
                options: [
                    'By boldly facing the challenge head-on',
                    'Through strategic planning and wise guidance',
                    'By humbly serving and supporting them',
                    'By encouraging patient endurance',
                    'By inspiring faith and hope'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 8
            },
            {
                id: 'life_challenges_q9',
                text: 'What helps you maintain resilience during long-term struggles?',
                options: [
                    'My courageous spirit and determination',
                    'Seeking understanding of the situation',
                    'The help and service of my community',
                    'My ability to patiently endure hardship',
                    'My faithful trust in God\'s plan'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 9
            },
            {
                id: 'life_challenges_q10',
                text: 'How do challenges help you grow in humility?',
                options: [
                    'They remind me that courage isn\'t self-generated',
                    'They show me how much I still need to understand',
                    'They teach me to accept help and service from others',
                    'They require patient waiting beyond my control',
                    'They deepen my faith and dependence on God'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 10
            },
            {
                id: 'life_challenges_q11',
                text: 'What helps you overcome feelings of being overwhelmed?',
                options: [
                    'Taking bold action to regain control',
                    'Seeking wise perspective and understanding',
                    'Accepting help and support from others',
                    'Learning to wait patiently for clarity',
                    'Renewing my faith and trust in God'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 11
            },
            {
                id: 'life_challenges_q12',
                text: 'How do you want your response to challenges to influence others?',
                options: [
                    'By inspiring courage and boldness',
                    'By demonstrating wisdom in difficulty',
                    'By showing the power of mutual support and service',
                    'By modeling patient perseverance',
                    'By displaying unwavering faith and trust'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'life_challenges',
                order: 12
            },

            // Biblical Reflection section (1-12)
            {
                id: 'biblical_reflection_q1',
                text: 'Which Bible stories do you most relate to?',
                options: [
                    'Stories of courage (David, Joshua)',
                    'Stories of wisdom (Solomon, Daniel)',
                    'Stories of faith (Abraham, Moses)',
                    'Stories of service (Martha, Tabitha)',
                    'Stories of transformation (Paul, Peter)'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 1
            },
            {
                id: 'biblical_reflection_q2',
                text: 'What values from scripture are most important to you?',
                options: [
                    'Faith',
                    'Wisdom',
                    'Love',
                    'Justice',
                    'Mercy',
                    'Courage'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 2
            },
            {
                id: 'biblical_reflection_q3',
                text: 'What aspect of God\'s character do you connect with most?',
                options: [
                    'God\'s wisdom',
                    'God\'s love',
                    'God\'s faithfulness',
                    'God\'s justice',
                    'God\'s mercy',
                    'God\'s strength'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 3
            },
            {
                id: 'biblical_reflection_q4',
                text: 'Which biblical figure\'s journey is most meaningful to you?',
                options: [
                    'Abraham\'s journey of faith',
                    'Joseph\'s journey through hardship to blessing',
                    'Moses\' leadership journey',
                    'David\'s journey from shepherd to king',
                    'Paul\'s transformation and ministry'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 4
            },
            {
                id: 'biblical_reflection_q5',
                text: 'What part of the Bible speaks most to your current life stage?',
                options: [
                    'Psalms - for comfort and praise',
                    'Proverbs - for wisdom and guidance',
                    'Gospels - for Jesus\' teachings',
                    'Epistles - for practical Christian living',
                    'Prophets - for calling and purpose'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 5
            },
            {
                id: 'biblical_reflection_q6',
                text: 'When reading scripture, what do you seek most?',
                options: [
                    'Practical guidance for daily life',
                    'Deeper understanding of God\'s character',
                    'Comfort during difficult times',
                    'Inspiration for serving others',
                    'Wisdom for important decisions'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 6
            },
            {
                id: 'biblical_reflection_q7',
                text: 'Which biblical theme resonates most with your current season?',
                options: [
                    'Stories of courage and bold faith',
                    'Passages about wisdom and discernment',
                    'Examples of service and helping others',
                    'Verses about patient waiting and endurance',
                    'Promises about faithful trust in God'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 7
            },
            {
                id: 'biblical_reflection_q8',
                text: 'How do you hope to lead like biblical leaders?',
                options: [
                    'With the courage of Joshua or David',
                    'With the strategic wisdom of Daniel or Joseph',
                    'With the servant heart of Jesus or Paul',
                    'With the patient endurance of Job or Abraham',
                    'With the faithful trust of Mary or Moses'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 8
            },
            {
                id: 'biblical_reflection_q9',
                text: 'What biblical quality do you most want to develop for resilience?',
                options: [
                    'The bold courage of Esther or Gideon',
                    'The wise understanding of Solomon or Daniel',
                    'The serving heart of Martha or Barnabas',
                    'The patient endurance of Job or Anna',
                    'The faithful trust of Abraham or Hannah'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 9
            },
            {
                id: 'biblical_reflection_q10',
                text: 'Which biblical example of humility speaks to you most?',
                options: [
                    'David acknowledging his courage came from God',
                    'Solomon asking for wisdom rather than riches',
                    'Jesus washing the disciples\' feet in service',
                    'Mary waiting patiently for God\'s promises',
                    'John the Baptist declaring his faith in Jesus'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 10
            },
            {
                id: 'biblical_reflection_q11',
                text: 'What biblical story helps you overcome your struggles?',
                options: [
                    'David facing Goliath with courage',
                    'Daniel seeking God\'s wisdom in crisis',
                    'Good Samaritan serving someone in need',
                    'Job patiently enduring through trials',
                    'Abraham trusting God\'s faithful promises'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 11
            },
            {
                id: 'biblical_reflection_q12',
                text: 'How do you want biblical truth to influence others through you?',
                options: [
                    'By inspiring bold and courageous faith',
                    'By sharing wisdom and biblical understanding',
                    'By demonstrating Christ-like service and help',
                    'By modeling patient trust in God\'s timing',
                    'By displaying faithful devotion and hope'
                ],
                allowMultiple: true,
                allowCustomInput: true,
                sectionId: 'biblical_reflection',
                order: 12
            }
        ];

        // Only seed questions if none exist
        if (questionCount === 0) {
            await QuizQuestion.insertMany(questions);
            console.log('Quiz questions seeded successfully');
        }
        // If we have some questions but not all of them
        else if (questionCount < questions.length) {
            console.log(`Found ${questionCount} questions, but expected ${questions.length}. Adding missing questions...`);

            // Get existing question IDs
            const existingQuestions = await QuizQuestion.find({}, 'id');
            const existingIds = new Set(existingQuestions.map(q => q.id));

            // Filter out questions that already exist
            const newQuestions = questions.filter(q => !existingIds.has(q.id));

            if (newQuestions.length > 0) {
                await QuizQuestion.insertMany(newQuestions);
                console.log(`Added ${newQuestions.length} new quiz questions`);
            } else {
                console.log('No new questions to add');
            }
        } else {
            console.log('All quiz questions already exist');
        }

        console.log('Quiz data seeding complete');
    } catch (error) {
        console.error('Error seeding quiz data:', error);
    }
};