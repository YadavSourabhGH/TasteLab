function StepsList({ steps, onUpdate, onDelete }) {
    if (!steps || steps.length === 0) {
        return (
            <div className="empty-list">
                <p>No steps yet. Click "Add Step" to start.</p>
            </div>
        );
    }

    return (
        <div className="steps-list">
            {steps.map((step, index) => (
                <div key={index} className="step-item">
                    <div className="step-number">
                        {index + 1}
                    </div>
                    <div className="step-content">
                        <textarea
                            className="step-instruction"
                            value={step.instruction || ''}
                            onChange={(e) => onUpdate(index, 'instruction', e.target.value)}
                            placeholder="Describe this step..."
                            rows={2}
                        />
                        <input
                            type="text"
                            className="step-notes"
                            value={step.notes || ''}
                            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
                            placeholder="Notes or tips (optional)"
                        />
                    </div>
                    <button
                        className="btn-icon-delete"
                        onClick={() => onDelete(index)}
                        title="Delete step"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default StepsList;
