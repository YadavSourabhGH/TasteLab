import { useState } from 'react';
import { recipeApi } from '../services/api';

function InviteModal({ recipeId, onClose, onInvited }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('collaborator');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await recipeApi.invite(recipeId, email, role);
            setSuccess(`Invited ${email} as ${role}`);
            setEmail('');
            onInvited();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to invite user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Invite Collaborators</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✓</span>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="invite-email">Email Address</label>
                        <input
                            type="email"
                            id="invite-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="invite-role">Role</label>
                        <select
                            id="invite-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="collaborator">Collaborator (can edit)</option>
                            <option value="viewer">Viewer (read only)</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Inviting...' : 'Send Invite'}
                        </button>
                    </div>
                </form>

                <div className="modal-info">
                    <p>
                        <strong>Note:</strong> The invited user must have a TasteLab account
                        with this email address.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default InviteModal;
