const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, unique: false }, // One scripture per day
    verse: { type: String, required: true },  // e.g., "John 3:16"
    text: { type: String, required: true },    // Full scripture text
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const Bookmark = mongoose.model("Bookmark", BookmarkSchema);

module.exports = { BookmarkSchema, Bookmark };