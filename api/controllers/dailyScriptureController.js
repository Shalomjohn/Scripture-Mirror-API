const { DailyScripture } = require("../models/daily_scripture");

exports.setDailyScripture = async (req, res) => {
    try {
        const { verse, text } = req.body;
        const scripture = await DailyScripture.findOneAndUpdate(
            { date: new Date().setHours(0, 0, 0, 0) }, // Ensure only one scripture per day
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
        const scripture = await DailyScripture.findOne({
            date: new Date().setHours(0, 0, 0, 0),
        });
        if (!scripture) return res.json({ message: "No scripture for today yet" });
        res.json(scripture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

