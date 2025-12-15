const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    quantity: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
});

const stepSchema = new mongoose.Schema({
    order: {
        type: Number,
        default: 0
    },
    instruction: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
});

const versionSchema = new mongoose.Schema({
    versionNumber: {
        type: Number,
        required: true
    },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    title: String,
    description: String,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const collaboratorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['collaborator', 'viewer'],
        default: 'collaborator'
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a recipe title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    image: {
        type: String,
        default: ''
    },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [collaboratorSchema],
    versionHistory: [versionSchema],
    currentVersion: {
        type: Number,
        default: 1
    },
    originalRecipe: {
        title: String,
        description: String,
        ingredients: [ingredientSchema],
        steps: [stepSchema]
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
recipeSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to save a new version
recipeSchema.methods.saveVersion = function (userId, message = '') {
    const newVersion = {
        versionNumber: this.currentVersion,
        ingredients: [...this.ingredients],
        steps: [...this.steps],
        title: this.title,
        description: this.description,
        updatedBy: userId,
        message: message,
        timestamp: new Date()
    };

    this.versionHistory.push(newVersion);
    this.currentVersion += 1;
    return this.save();
};

// Method to check if user has access
recipeSchema.methods.hasAccess = function (userId, requiredRole = 'viewer') {
    // If no userId provided, deny access
    if (!userId) return false;

    // Convert userId to string for comparison
    const userIdStr = userId.toString();

    // Get owner ID - handle both populated object and ObjectId
    const ownerId = this.owner?._id ? this.owner._id.toString() : this.owner?.toString();

    // Owner always has access
    if (ownerId && ownerId === userIdStr) {
        return true;
    }

    // Check collaborators
    const collaborator = this.collaborators?.find(c => {
        const collabUserId = c.user?._id ? c.user._id.toString() : c.user?.toString();
        return collabUserId && collabUserId === userIdStr;
    });

    if (!collaborator) return false;

    if (requiredRole === 'viewer') {
        return true;
    }

    return collaborator.role === 'collaborator';
};

module.exports = mongoose.model('Recipe', recipeSchema);
