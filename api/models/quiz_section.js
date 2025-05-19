// src/models/quiz_section.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSectionSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['single_choice', 'multiple_choice', 'text_input'],
        default: 'single_choice'
    },
    required: {
        type: Boolean,
        default: true
    },
    options: [{
        label: String,
        value: String
    }],
    allowCustomInput: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        required: true
    }
});

const QuizSection = mongoose.model('QuizSection', QuizSectionSchema);
module.exports = QuizSection;