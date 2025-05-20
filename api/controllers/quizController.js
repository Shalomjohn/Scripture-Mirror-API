// src/controllers/quizController.js
const QuizSection = require('../models/quiz_section');
const QuizQuestion = require('../models/quiz_question');

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

        // Create quiz questions - expanded set
        const questions = [
            // Personality section
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

            // Spiritual Journey section
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

            // Daily Habits section
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

            // Life Challenges section
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

            // Biblical Reflection section
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