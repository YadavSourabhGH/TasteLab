const express = require('express');
const router = express.Router();
const {
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    saveVersion,
    getVersions,
    restoreVersion,
    inviteCollaborator,
    removeCollaborator
} = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main CRUD routes
router.route('/')
    .get(getRecipes)
    .post(createRecipe);

router.route('/:id')
    .get(getRecipe)
    .put(updateRecipe)
    .delete(deleteRecipe);

// Version routes
router.post('/:id/version', saveVersion);
router.get('/:id/versions', getVersions);
router.post('/:id/restore/:versionId', restoreVersion);

// Collaboration routes
router.post('/:id/invite', inviteCollaborator);
router.delete('/:id/collaborator/:userId', removeCollaborator);

module.exports = router;
