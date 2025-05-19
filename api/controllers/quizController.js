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

// Get questions for a specific section
exports.getQuizQuestions = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const questions = await QuizQuestion.find({ sectionId }).sort({ order: 1 });

        if (!questions.length) {
            return res.status(404).json({ error: 'No questions found for this section' });
        }

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Seed initial quiz sections and questions
exports.seedQuizData = async () => {
    try {
        // Check if data already exists
        const sectionCount = await QuizSection.countDocuments();
        if (sectionCount > 0) {
            console.log('Quiz data already exists');
            return;
        }

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

        await QuizSection.insertMany(sections);

        // Create quiz questions
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
            }
        ];

        await QuizQuestion.insertMany(questions);
        console.log('Quiz data seeded successfully');
    } catch (error) {
        console.error('Error seeding quiz data:', error);
    }
};