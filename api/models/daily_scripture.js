const mongoose = require("mongoose");

const DailyScriptureSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now }, // One scripture per day
    verse: { type: String, required: true },  // e.g., "John 3:16"
    text: { type: String, required: true },    // Full scripture text
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const DailyScripture = mongoose.model("DailyScripture", DailyScriptureSchema);

module.exports = { DailyScriptureSchema, DailyScripture };