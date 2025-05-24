// Add these methods to your existing authController.js

const User = require("../models/user");

// Get user's reflections
exports.getReflections = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('reflections');

        const reflections = user.reflections || [];

        // Sort by creation date (newest first)
        reflections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            reflections
        });
    } catch (error) {
        console.error('Error getting reflections:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new reflection
exports.createReflection = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const user = await User.findById(req.user._id);

        const newReflection = {
            id: new Date().getTime().toString(), // Simple ID generation
            title: title?.trim() || '',
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!user.reflections) {
            user.reflections = [];
        }

        user.reflections.push(newReflection);
        await user.save();

        res.status(201).json({
            reflection: newReflection
        });
    } catch (error) {
        console.error('Error creating reflection:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update an existing reflection
exports.updateReflection = async (req, res) => {
    try {
        const { reflectionId } = req.params;
        const { title, content } = req.body;

        if ((!content || content.trim().length === 0) && (!title || title.trim().length === 0)) {
            return res.status(400).json({ error: 'Title or Content is required' });
        }

        const user = await User.findById(req.user._id);

        const reflectionIndex = user.reflections.findIndex(r => r.id === reflectionId);

        if (reflectionIndex === -1) {
            return res.status(404).json({ error: 'Reflection not found' });
        }

        // Update the reflection
        user.reflections[reflectionIndex].title = title?.trim() || '';
        user.reflections[reflectionIndex].content = content?.trim();
        user.reflections[reflectionIndex].updatedAt = new Date();

        await user.save();

        res.json({
            reflection: user.reflections[reflectionIndex]
        });
    } catch (error) {
        console.error('Error updating reflection:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a reflection
exports.deleteReflection = async (req, res) => {
    try {
        const { reflectionId } = req.params;

        const user = await User.findById(req.user._id);

        const reflectionIndex = user.reflections.findIndex(r => r.id === reflectionId);

        if (reflectionIndex === -1) {
            return res.status(404).json({ error: 'Reflection not found' });
        }

        user.reflections.splice(reflectionIndex, 1);
        await user.save();

        res.json({ message: 'Reflection deleted successfully' });
    } catch (error) {
        console.error('Error deleting reflection:', error);
        res.status(500).json({ error: error.message });
    }
};