import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RecipeCard({ recipe, onDelete }) {
    const { user } = useAuth();
    const isOwner = user?.id === recipe.owner?._id;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="recipe-card">
            <div className="recipe-card-header">
                <div className="recipe-emoji">
                    {getRecipeEmoji(recipe.title)}
                </div>
                {recipe.versionHistory?.length > 0 && (
                    <div className="version-badge">
                        v{recipe.currentVersion}
                    </div>
                )}
            </div>

            <div className="recipe-card-body">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">
                    {recipe.description || 'No description'}
                </p>

                <div className="recipe-meta">
                    <div className="recipe-stats">
                        <span className="stat">
                            <span className="stat-icon">🥗</span>
                            {recipe.ingredients?.length || 0} ingredients
                        </span>
                        <span className="stat">
                            <span className="stat-icon">📝</span>
                            {recipe.steps?.length || 0} steps
                        </span>
                    </div>

                    {recipe.collaborators?.length > 0 && (
                        <div className="collaborators-preview">
                            {recipe.collaborators.slice(0, 3).map((collab, index) => (
                                <div
                                    key={collab.user._id}
                                    className="collaborator-avatar"
                                    style={{ zIndex: 3 - index }}
                                    title={collab.user.name}
                                >
                                    {collab.user.name?.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {recipe.collaborators.length > 3 && (
                                <div className="collaborator-more">
                                    +{recipe.collaborators.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="recipe-card-footer">
                <span className="recipe-date">
                    Updated {formatDate(recipe.updatedAt)}
                </span>
                <div className="recipe-actions">
                    <Link
                        to={`/edit/${recipe._id}`}
                        className="btn btn-primary btn-small"
                    >
                        Edit
                    </Link>
                    <Link
                        to={`/history/${recipe._id}`}
                        className="btn btn-ghost btn-small"
                        title="Version History"
                    >
                        📜
                    </Link>
                    {isOwner && (
                        <button
                            className="btn btn-ghost btn-small btn-danger"
                            onClick={() => onDelete(recipe._id)}
                            title="Delete Recipe"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to get emoji based on recipe title
function getRecipeEmoji(title) {
    const titleLower = title?.toLowerCase() || '';

    if (titleLower.includes('salad')) return '🥗';
    if (titleLower.includes('pasta') || titleLower.includes('spaghetti')) return '🍝';
    if (titleLower.includes('pizza')) return '🍕';
    if (titleLower.includes('cake') || titleLower.includes('chocolate')) return '🍰';
    if (titleLower.includes('cookie')) return '🍪';
    if (titleLower.includes('soup')) return '🍲';
    if (titleLower.includes('burger')) return '🍔';
    if (titleLower.includes('sushi')) return '🍣';
    if (titleLower.includes('taco')) return '🌮';
    if (titleLower.includes('bread')) return '🍞';
    if (titleLower.includes('pie')) return '🥧';
    if (titleLower.includes('pancake') || titleLower.includes('waffle')) return '🥞';
    if (titleLower.includes('chicken')) return '🍗';
    if (titleLower.includes('fish') || titleLower.includes('salmon')) return '🐟';
    if (titleLower.includes('steak') || titleLower.includes('beef')) return '🥩';
    if (titleLower.includes('rice')) return '🍚';
    if (titleLower.includes('curry')) return '🍛';
    if (titleLower.includes('ice cream')) return '🍨';
    if (titleLower.includes('smoothie')) return '🥤';
    if (titleLower.includes('coffee')) return '☕';

    return '🍽️';
}

export default RecipeCard;
