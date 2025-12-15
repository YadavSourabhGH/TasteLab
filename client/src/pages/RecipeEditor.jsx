import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import IngredientList from '../components/IngredientList';
import StepsList from '../components/StepsList';
import UserPresence from '../components/UserPresence';
import InviteModal from '../components/InviteModal';

function RecipeEditor() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        socket,
        isConnected,
        activeUsers,
        joinRoom,
        leaveRoom,
        emitIngredientChange,
        emitStepChange,
        emitRecipeMetaChange,
        emitVersionSaved
    } = useSocket();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch recipe
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await recipeApi.getOne(recipeId);
                setRecipe(res.data.recipe);
            } catch (err) {
                setError('Failed to load recipe');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [recipeId]);

    // Join/leave socket room
    useEffect(() => {
        if (isConnected && recipeId) {
            joinRoom(recipeId);
            return () => leaveRoom(recipeId);
        }
    }, [isConnected, recipeId, joinRoom, leaveRoom]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleIngredientChange = (data) => {
            setRecipe(prev => {
                if (!prev) return prev;
                const newIngredients = [...prev.ingredients];

                if (data.operation === 'update') {
                    if (newIngredients[data.ingredientIndex]) {
                        newIngredients[data.ingredientIndex] = {
                            ...newIngredients[data.ingredientIndex],
                            [data.field]: data.value
                        };
                    }
                } else if (data.operation === 'add') {
                    newIngredients.push(data.value);
                } else if (data.operation === 'delete') {
                    newIngredients.splice(data.ingredientIndex, 1);
                }

                return { ...prev, ingredients: newIngredients };
            });
            setHasChanges(true);
        };

        const handleStepChange = (data) => {
            setRecipe(prev => {
                if (!prev) return prev;
                const newSteps = [...prev.steps];

                if (data.operation === 'update') {
                    if (newSteps[data.stepIndex]) {
                        newSteps[data.stepIndex] = {
                            ...newSteps[data.stepIndex],
                            [data.field]: data.value
                        };
                    }
                } else if (data.operation === 'add') {
                    newSteps.push(data.value);
                } else if (data.operation === 'delete') {
                    newSteps.splice(data.stepIndex, 1);
                }

                return { ...prev, steps: newSteps };
            });
            setHasChanges(true);
        };

        const handleRecipeMetaChange = (data) => {
            setRecipe(prev => {
                if (!prev) return prev;
                return { ...prev, [data.field]: data.value };
            });
            setHasChanges(true);
        };

        const handleVersionSaved = (data) => {
            setRecipe(prev => ({
                ...prev,
                currentVersion: (prev?.currentVersion || 0) + 1
            }));
        };

        socket.on('ingredientChange', handleIngredientChange);
        socket.on('stepChange', handleStepChange);
        socket.on('recipeMetaChange', handleRecipeMetaChange);
        socket.on('versionSaved', handleVersionSaved);

        return () => {
            socket.off('ingredientChange', handleIngredientChange);
            socket.off('stepChange', handleStepChange);
            socket.off('recipeMetaChange', handleRecipeMetaChange);
            socket.off('versionSaved', handleVersionSaved);
        };
    }, [socket]);

    // Auto-save
    useEffect(() => {
        if (!hasChanges || !recipe) return;

        const saveTimer = setTimeout(async () => {
            try {
                await recipeApi.update(recipeId, {
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps
                });
                setLastSaved(new Date());
                setHasChanges(false);
            } catch (err) {
                console.error('Auto-save failed:', err);
            }
        }, 2000);

        return () => clearTimeout(saveTimer);
    }, [hasChanges, recipe, recipeId]);

    // Handle local changes
    const handleTitleChange = (e) => {
        const value = e.target.value;
        setRecipe(prev => ({ ...prev, title: value }));
        emitRecipeMetaChange({ recipeId, field: 'title', value });
        setHasChanges(true);
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setRecipe(prev => ({ ...prev, description: value }));
        emitRecipeMetaChange({ recipeId, field: 'description', value });
        setHasChanges(true);
    };

    const handleIngredientUpdate = (index, field, value) => {
        setRecipe(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
        emitIngredientChange({ recipeId, ingredientIndex: index, field, value, operation: 'update' });
        setHasChanges(true);
    };

    const handleAddIngredient = () => {
        const newIngredient = { name: '', quantity: '', unit: '', notes: '' };
        setRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient]
        }));
        emitIngredientChange({ recipeId, value: newIngredient, operation: 'add' });
        setHasChanges(true);
    };

    const handleDeleteIngredient = (index) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
        emitIngredientChange({ recipeId, ingredientIndex: index, operation: 'delete' });
        setHasChanges(true);
    };

    const handleStepUpdate = (index, field, value) => {
        setRecipe(prev => {
            const newSteps = [...prev.steps];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return { ...prev, steps: newSteps };
        });
        emitStepChange({ recipeId, stepIndex: index, field, value, operation: 'update' });
        setHasChanges(true);
    };

    const handleAddStep = () => {
        const newStep = {
            order: recipe.steps.length + 1,
            instruction: '',
            notes: ''
        };
        setRecipe(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));
        emitStepChange({ recipeId, value: newStep, operation: 'add' });
        setHasChanges(true);
    };

    const handleDeleteStep = (index) => {
        setRecipe(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
        emitStepChange({ recipeId, stepIndex: index, operation: 'delete' });
        setHasChanges(true);
    };

    const handleSaveVersion = async () => {
        setSaving(true);
        try {
            await recipeApi.saveVersion(recipeId, 'Manual save');
            emitVersionSaved({ recipeId, version: recipe.currentVersion + 1 });
            setRecipe(prev => ({
                ...prev,
                currentVersion: prev.currentVersion + 1
            }));
        } catch (err) {
            setError('Failed to save version');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading recipe...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-screen">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <Link to="/catalog" className="btn btn-primary">
                    Back to Catalog
                </Link>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="error-screen">
                <span className="error-icon">🔍</span>
                <p>Recipe not found</p>
                <Link to="/catalog" className="btn btn-primary">
                    Back to Catalog
                </Link>
            </div>
        );
    }

    const isOwner = user?.id === recipe.owner?._id;

    return (
        <div className="editor-page">
            {/* Editor Header */}
            <header className="editor-header">
                <div className="header-left">
                    <Link to="/catalog" className="back-link">
                        ← Back to Catalog
                    </Link>
                    <div className="connection-status">
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        {isConnected ? 'Connected' : 'Reconnecting...'}
                    </div>
                </div>

                <div className="header-right">
                    <UserPresence users={activeUsers} />

                    {lastSaved && (
                        <span className="last-saved">
                            Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}

                    <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setShowOriginal(!showOriginal)}
                    >
                        {showOriginal ? 'Hide Original' : 'Show Original'}
                    </button>

                    <Link
                        to={`/history/${recipeId}`}
                        className="btn btn-secondary btn-small"
                    >
                        📜 History
                    </Link>

                    {isOwner && (
                        <button
                            className="btn btn-secondary btn-small"
                            onClick={() => setShowInviteModal(true)}
                        >
                            👥 Invite
                        </button>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleSaveVersion}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Version'}
                    </button>
                </div>
            </header>

            {/* Editor Content */}
            <div className={`editor-content ${showOriginal ? 'with-original' : ''}`}>
                {/* Original Recipe Panel */}
                {showOriginal && recipe.originalRecipe && (
                    <div className="original-panel">
                        <div className="panel-header">
                            <h3>Original Recipe</h3>
                        </div>
                        <div className="panel-content">
                            <h2 className="original-title">{recipe.originalRecipe.title}</h2>
                            <p className="original-description">{recipe.originalRecipe.description}</p>

                            <div className="original-section">
                                <h4>Ingredients</h4>
                                <ul className="original-list">
                                    {recipe.originalRecipe.ingredients?.map((ing, i) => (
                                        <li key={i}>
                                            {ing.quantity} {ing.unit} {ing.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="original-section">
                                <h4>Steps</h4>
                                <ol className="original-steps">
                                    {recipe.originalRecipe.steps?.map((step, i) => (
                                        <li key={i}>{step.instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Editor Panel */}
                <div className="editor-panel">
                    <div className="recipe-header-edit">
                        <div className="version-info">
                            Version {recipe.currentVersion}
                        </div>
                        <input
                            type="text"
                            className="recipe-title-input"
                            value={recipe.title}
                            onChange={handleTitleChange}
                            placeholder="Recipe Title"
                        />
                        <textarea
                            className="recipe-description-input"
                            value={recipe.description || ''}
                            onChange={handleDescriptionChange}
                            placeholder="Add a description..."
                            rows={2}
                        />
                    </div>

                    <div className="editor-sections">
                        <div className="editor-section">
                            <div className="section-header">
                                <h3>🥗 Ingredients</h3>
                                <button
                                    className="btn btn-small btn-ghost"
                                    onClick={handleAddIngredient}
                                >
                                    + Add
                                </button>
                            </div>
                            <IngredientList
                                ingredients={recipe.ingredients}
                                onUpdate={handleIngredientUpdate}
                                onDelete={handleDeleteIngredient}
                            />
                        </div>

                        <div className="editor-section">
                            <div className="section-header">
                                <h3>📝 Instructions</h3>
                                <button
                                    className="btn btn-small btn-ghost"
                                    onClick={handleAddStep}
                                >
                                    + Add Step
                                </button>
                            </div>
                            <StepsList
                                steps={recipe.steps}
                                onUpdate={handleStepUpdate}
                                onDelete={handleDeleteStep}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteModal
                    recipeId={recipeId}
                    onClose={() => setShowInviteModal(false)}
                    onInvited={() => {
                        // Refresh recipe to show new collaborators
                        recipeApi.getOne(recipeId).then(res => {
                            setRecipe(res.data.recipe);
                        });
                    }}
                />
            )}
        </div>
    );
}

export default RecipeEditor;
