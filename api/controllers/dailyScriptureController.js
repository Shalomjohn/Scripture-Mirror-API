const { DailyScripture } = require("../models/daily_scripture");
const inspirationalVerses = require('../helpers/inspirational_scriptures');

const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * inspirationalVerses.length);
    return inspirationalVerses[randomIndex];
};

exports.setDailyScripture = async (req, res) => {
    try {
        let { verse, text, date } = req.body;
        // parse date
        if (date) {
            const dateParts = date.split("-");
            date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).setHours(0, 0, 0, 0);
        } else {
            date = new Date().setHours(0, 0, 0, 0);
        }
        const scripture = await DailyScripture.findOneAndUpdate(
            { date: date }, // Ensure only one scripture per day
            { verse, text },
            { new: true, upsert: true }
        );
        res.json({ message: "Scripture set for today", scripture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDailyScripture = async (req, res) => {
    try {
        let scripture = await DailyScripture.findOne({
            date: new Date().setHours(0, 0, 0, 0),
            userId: req.user._id,
        });

        // If no scripture exists for today, create one with a random verse
        if (!scripture) {
            const randomVerse = getRandomVerse();

            scripture = new DailyScripture({
                date: new Date().setHours(0, 0, 0, 0),
                verse: randomVerse.verse,
                text: randomVerse.text,
                userId: req.user._id,
            });

            await scripture.save();
        }

        res.json(scripture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

