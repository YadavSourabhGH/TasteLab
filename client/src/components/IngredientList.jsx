function IngredientList({ ingredients, onUpdate, onDelete }) {
    if (!ingredients || ingredients.length === 0) {
        return (
            <div className="empty-list">
                <p>No ingredients yet. Click "Add" to start.</p>
            </div>
        );
    }

    return (
        <div className="ingredient-list">
            {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                    <div className="ingredient-fields">
                        <input
                            type="text"
                            className="ingredient-quantity"
                            value={ingredient.quantity || ''}
                            onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                        />
                        <input
                            type="text"
                            className="ingredient-unit"
                            value={ingredient.unit || ''}
                            onChange={(e) => onUpdate(index, 'unit', e.target.value)}
                            placeholder="Unit"
                        />
                        <input
                            type="text"
                            className="ingredient-name"
                            value={ingredient.name || ''}
                            onChange={(e) => onUpdate(index, 'name', e.target.value)}
                            placeholder="Ingredient name"
                        />
                        <input
                            type="text"
                            className="ingredient-notes"
                            value={ingredient.notes || ''}
                            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
                            placeholder="Notes (optional)"
                        />
                    </div>
                    <button
                        className="btn-icon-delete"
                        onClick={() => onDelete(index)}
                        title="Delete ingredient"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default IngredientList;
