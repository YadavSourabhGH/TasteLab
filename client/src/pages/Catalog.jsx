import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi } from '../services/api';
import RecipeCard from '../components/RecipeCard';

function Catalog() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRecipe, setNewRecipe] = useState({ title: '', description: '' });
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await recipeApi.getAll();
            setRecipes(res.data.recipes);
        } catch (err) {
            setError('Failed to load recipes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRecipe = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await recipeApi.create({
                title: newRecipe.title,
                description: newRecipe.description,
                ingredients: [],
                steps: []
            });
            setShowCreateModal(false);
            setNewRecipe({ title: '', description: '' });
            navigate(`/edit/${res.data.recipe._id}`);
        } catch (err) {
            setError('Failed to create recipe');
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteRecipe = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await recipeApi.delete(id);
            setRecipes(recipes.filter(r => r._id !== id));
        } catch (err) {
            setError('Failed to delete recipe');
            console.error(err);
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading your recipes...</p>
            </div>
        );
    }

    return (
        <div className="catalog-page">
            <header className="catalog-header">
                <div className="header-content">
                    <h1>Recipe Catalog</h1>
                    <p>Your collection of collaborative recipes</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <span className="btn-icon">+</span>
                    New Recipe
                </button>
            </header>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}

            <div className="catalog-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredRecipes.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📖</span>
                    <h2>No recipes yet</h2>
                    <p>Create your first recipe to start collaborating!</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create Recipe
                    </button>
                </div>
            ) : (
                <div className="recipes-grid">
                    {filteredRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe._id}
                            recipe={recipe}
                            onDelete={handleDeleteRecipe}
                        />
                    ))}
                </div>
            )}

            {/* Create Recipe Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Recipe</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateRecipe} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="recipe-title">Recipe Title</label>
                                <input
                                    type="text"
                                    id="recipe-title"
                                    value={newRecipe.title}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                                    placeholder="e.g., Grandma's Apple Pie"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="recipe-description">Description (optional)</label>
                                <textarea
                                    id="recipe-description"
                                    value={newRecipe.description}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                                    placeholder="A brief description of your recipe..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creating}
                                >
                                    {creating ? 'Creating...' : 'Create Recipe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Catalog;
