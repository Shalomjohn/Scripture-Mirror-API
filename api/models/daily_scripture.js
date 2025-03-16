const mongoose = require("mongoose");

const DailyScriptureSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, unique: true }, // One scripture per day
    verse: { type: String, required: true },  // e.g., "John 3:16"
    text: { type: String, required: true }    // Full scripture text
});

module.exports = mongoose.model("DailyScripture", DailyScriptureSchema);
