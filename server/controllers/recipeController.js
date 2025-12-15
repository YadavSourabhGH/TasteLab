const Recipe = require('../models/Recipe');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Private
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id },
                { isPublic: true }
            ]
        })
            .populate('owner', 'name email avatar')
            .populate('collaborators.user', 'name email avatar')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: recipes.length,
            recipes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Private
exports.getRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('collaborators.user', 'name email avatar')
            .populate('versionHistory.updatedBy', 'name email avatar');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check access
        if (!recipe.isPublic && !recipe.hasAccess(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this recipe'
            });
        }

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, steps, tags, isPublic } = req.body;

        const recipe = await Recipe.create({
            title,
            description,
            ingredients: ingredients || [],
            steps: steps || [],
            tags: tags || [],
            isPublic: isPublic || false,
            owner: req.user.id,
            originalRecipe: {
                title,
                description,
                ingredients: ingredients || [],
                steps: steps || []
            }
        });

        await recipe.populate('owner', 'name email avatar');

        res.status(201).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check authorization
        if (!recipe.hasAccess(req.user.id, 'collaborator')) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this recipe'
            });
        }

        const { title, description, ingredients, steps, tags, isPublic } = req.body;

        // Use findByIdAndUpdate to avoid version conflicts
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (ingredients) updateData.ingredients = ingredients;
        if (steps) updateData.steps = steps;
        if (tags) updateData.tags = tags;

        // Only owner can change public status
        if (recipe.owner.toString() === req.user.id && isPublic !== undefined) {
            updateData.isPublic = isPublic;
        }

        updateData.updatedAt = new Date();

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: false }
        )
            .populate('owner', 'name email avatar')
            .populate('collaborators.user', 'name email avatar');

        res.status(200).json({
            success: true,
            recipe: updatedRecipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Owner only)
exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Only owner can delete
        if (recipe.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this recipe'
            });
        }

        await recipe.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Recipe deleted'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Save version
// @route   POST /api/recipes/:id/version
// @access  Private
exports.saveVersion = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        if (!recipe.hasAccess(req.user.id, 'collaborator')) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to save versions'
            });
        }

        const { message } = req.body;
        await recipe.saveVersion(req.user.id, message || '');

        await recipe.populate('versionHistory.updatedBy', 'name email avatar');

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get version history
// @route   GET /api/recipes/:id/versions
// @access  Private
exports.getVersions = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .select('versionHistory currentVersion originalRecipe owner collaborators isPublic')
            .populate('versionHistory.updatedBy', 'name email avatar');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        if (!recipe.hasAccess(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view versions'
            });
        }

        res.status(200).json({
            success: true,
            versions: recipe.versionHistory,
            currentVersion: recipe.currentVersion,
            originalRecipe: recipe.originalRecipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Restore version
// @route   POST /api/recipes/:id/restore/:versionId
// @access  Private
exports.restoreVersion = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        if (!recipe.hasAccess(req.user.id, 'collaborator')) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to restore versions'
            });
        }

        const version = recipe.versionHistory.id(req.params.versionId);
        if (!version) {
            return res.status(404).json({
                success: false,
                message: 'Version not found'
            });
        }

        // Save current state before restoring
        await recipe.saveVersion(req.user.id, `Before restore to v${version.versionNumber}`);

        // Restore from version
        recipe.title = version.title;
        recipe.description = version.description;
        recipe.ingredients = version.ingredients;
        recipe.steps = version.steps;

        await recipe.save();
        await recipe.populate('owner', 'name email avatar');
        await recipe.populate('collaborators.user', 'name email avatar');

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Invite collaborator
// @route   POST /api/recipes/:id/invite
// @access  Private (Owner only)
exports.inviteCollaborator = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Only owner can invite
        if (recipe.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can invite collaborators'
            });
        }

        const { email, role } = req.body;

        // Find user by email
        const User = require('../models/User');
        const userToInvite = await User.findOne({ email });

        if (!userToInvite) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Check if already a collaborator
        const existingCollaborator = recipe.collaborators.find(
            c => c.user.toString() === userToInvite._id.toString()
        );

        if (existingCollaborator) {
            return res.status(400).json({
                success: false,
                message: 'User is already a collaborator'
            });
        }

        recipe.collaborators.push({
            user: userToInvite._id,
            role: role || 'collaborator'
        });

        await recipe.save();
        await recipe.populate('collaborators.user', 'name email avatar');

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove collaborator
// @route   DELETE /api/recipes/:id/collaborator/:userId
// @access  Private (Owner only)
exports.removeCollaborator = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Only owner can remove
        if (recipe.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can remove collaborators'
            });
        }

        recipe.collaborators = recipe.collaborators.filter(
            c => c.user.toString() !== req.params.userId
        );

        await recipe.save();
        await recipe.populate('collaborators.user', 'name email avatar');

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
