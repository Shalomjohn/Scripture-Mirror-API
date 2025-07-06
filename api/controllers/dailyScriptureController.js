const { DailyScripture } = require("../models/daily_scripture");

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
        const scripture = await DailyScripture.findOne({
            date: new Date().setHours(0, 0, 0, 0),
        });
        if (!scripture) return res.json({ message: "No scripture for today yet" });
        res.json(scripture);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}

