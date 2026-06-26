// Add these methods to your existing authController.js

const User = require("../models/user");

// Get user's reflections
exports.getReflections = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('reflections reflectionFolders');

        const reflections = user.reflections || [];
        const folders = user.reflectionFolders || [];

        // Sort by creation date (newest first)
        reflections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            reflections,
            folders
        });
    } catch (error) {
        console.error('Error getting reflections:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new reflection
exports.createReflection = async (req, res) => {
    try {
        const { title, content, folderId } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const user = await User.findById(req.user._id);

        const newReflection = {
            id: new Date().getTime().toString(), // Simple ID generation
            title: title?.trim() || '',
            content: content.trim(),
            folderId: folderId || null,
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
        const { title, content, folderId } = req.body;

        if ((!content || content.trim().length === 0) && (!title || title.trim().length === 0) && folderId === undefined) {
            return res.status(400).json({ error: 'Title, Content, or Folder ID is required' });
        }

        const user = await User.findById(req.user._id);

        const reflectionIndex = user.reflections.findIndex(r => r.id === reflectionId);

        if (reflectionIndex === -1) {
            return res.status(404).json({ error: 'Reflection not found' });
        }

        // Update the reflection
        if (title !== undefined) user.reflections[reflectionIndex].title = title?.trim() || '';
        if (content !== undefined) user.reflections[reflectionIndex].content = content?.trim();
        if (folderId !== undefined) user.reflections[reflectionIndex].folderId = folderId || null;
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

// Create a folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const user = await User.findById(req.user._id);
        const newFolder = {
            id: new Date().getTime().toString(),
            name: name.trim(),
            parentId: parentId || null,
            createdAt: new Date()
        };

        if (!user.reflectionFolders) user.reflectionFolders = [];
        user.reflectionFolders.push(newFolder);
        await user.save();

        res.status(201).json({ folder: newFolder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a folder
exports.updateFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const { name, parentId } = req.body;

        const user = await User.findById(req.user._id);
        const folderIndex = user.reflectionFolders.findIndex(f => f.id === folderId);

        if (folderIndex === -1) return res.status(404).json({ error: 'Folder not found' });

        if (name !== undefined) user.reflectionFolders[folderIndex].name = name.trim();
        if (parentId !== undefined) user.reflectionFolders[folderIndex].parentId = parentId || null;

        await user.save();
        res.json({ folder: user.reflectionFolders[folderIndex] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a folder
exports.deleteFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const user = await User.findById(req.user._id);

        const folderIndex = user.reflectionFolders.findIndex(f => f.id === folderId);
        if (folderIndex === -1) return res.status(404).json({ error: 'Folder not found' });

        user.reflectionFolders.splice(folderIndex, 1);
        
        // Also update any reflections in this folder to have no folder (or delete them, but better to un-folder)
        if (user.reflections) {
            user.reflections.forEach(r => {
                if (r.folderId === folderId) r.folderId = null;
            });
        }
        
        // Also update any child folders
        if (user.reflectionFolders) {
            user.reflectionFolders.forEach(f => {
                if (f.parentId === folderId) f.parentId = null;
            });
        }

        await user.save();
        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};