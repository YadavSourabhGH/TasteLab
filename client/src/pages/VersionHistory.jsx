import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function VersionHistory() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [versions, setVersions] = useState([]);
    const [originalRecipe, setOriginalRecipe] = useState(null);
    const [currentVersion, setCurrentVersion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [compareVersion, setCompareVersion] = useState(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const res = await recipeApi.getVersions(recipeId);
                setVersions(res.data.versions.sort((a, b) =>
                    b.versionNumber - a.versionNumber
                ));
                setCurrentVersion(res.data.currentVersion);
                setOriginalRecipe(res.data.originalRecipe);
            } catch (err) {
                setError('Failed to load version history');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVersions();
    }, [recipeId]);

    const handleRestore = async (versionId) => {
        if (!window.confirm('Are you sure you want to restore this version? Current changes will be saved first.')) {
            return;
        }

        setRestoring(true);
        try {
            await recipeApi.restoreVersion(recipeId, versionId);
            navigate(`/edit/${recipeId}`);
        } catch (err) {
            setError('Failed to restore version');
            console.error(err);
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading version history...</p>
            </div>
        );
    }

    return (
        <div className="history-page">
            <header className="history-header">
                <div className="header-left">
                    <Link to={`/edit/${recipeId}`} className="back-link">
                        ← Back to Editor
                    </Link>
                    <h1>Version History</h1>
                </div>
                <div className="header-right">
                    <span className="current-version-badge">
                        Current: v{currentVersion}
                    </span>
                </div>
            </header>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="history-content">
                {/* Timeline */}
                <div className="version-timeline">
                    <h2>Saved Versions</h2>

                    {versions.length === 0 ? (
                        <div className="empty-history">
                            <span className="empty-icon">📜</span>
                            <p>No versions saved yet</p>
                            <p className="empty-hint">Save a version in the editor to track changes</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {versions.map((version, index) => (
                                <div
                                    key={version._id}
                                    className={`timeline-item ${selectedVersion?._id === version._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedVersion(version)}
                                >
                                    <div className="timeline-marker">
                                        <div className="marker-dot"></div>
                                        {index < versions.length - 1 && <div className="marker-line"></div>}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="version-header">
                                            <span className="version-number">v{version.versionNumber}</span>
                                            <span className="version-date">{formatDate(version.timestamp)}</span>
                                        </div>
                                        <div className="version-author">
                                            by {version.updatedBy?.name || 'Unknown'}
                                        </div>
                                        {version.message && (
                                            <div className="version-message">{version.message}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Version Detail */}
                <div className="version-detail">
                    {selectedVersion ? (
                        <>
                            <div className="detail-header">
                                <h2>Version {selectedVersion.versionNumber}</h2>
                                <div className="detail-actions">
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={() => setCompareVersion(
                                            compareVersion?._id === selectedVersion._id ? null : selectedVersion
                                        )}
                                    >
                                        {compareVersion?._id === selectedVersion._id ? 'Clear Compare' : 'Compare'}
                                    </button>
                                    <button
                                        className="btn btn-primary btn-small"
                                        onClick={() => handleRestore(selectedVersion._id)}
                                        disabled={restoring}
                                    >
                                        {restoring ? 'Restoring...' : 'Restore This Version'}
                                    </button>
                                </div>
                            </div>

                            <div className="detail-meta">
                                <span>Saved {formatDate(selectedVersion.timestamp)}</span>
                                <span>by {selectedVersion.updatedBy?.name || 'Unknown'}</span>
                            </div>

                            <div className="version-snapshot">
                                <h3>{selectedVersion.title}</h3>
                                <p className="snapshot-description">{selectedVersion.description}</p>

                                <div className="snapshot-section">
                                    <h4>Ingredients ({selectedVersion.ingredients?.length || 0})</h4>
                                    <ul className="snapshot-list">
                                        {selectedVersion.ingredients?.map((ing, i) => (
                                            <li key={i}>
                                                <span className="ing-quantity">{ing.quantity} {ing.unit}</span>
                                                <span className="ing-name">{ing.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="snapshot-section">
                                    <h4>Steps ({selectedVersion.steps?.length || 0})</h4>
                                    <ol className="snapshot-steps">
                                        {selectedVersion.steps?.map((step, i) => (
                                            <li key={i}>{step.instruction}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection">
                            <span className="selection-icon">👆</span>
                            <p>Select a version to view details</p>
                        </div>
                    )}
                </div>

                {/* Compare Panel */}
                {compareVersion && selectedVersion && compareVersion._id !== selectedVersion._id && (
                    <div className="compare-panel">
                        <div className="compare-header">
                            <h3>Comparing v{compareVersion.versionNumber} vs v{selectedVersion.versionNumber}</h3>
                            <button
                                className="btn btn-ghost btn-small"
                                onClick={() => setCompareVersion(null)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="compare-content">
                            <div className="compare-column">
                                <h4>v{compareVersion.versionNumber}</h4>
                                <div className="compare-ingredients">
                                    {compareVersion.ingredients?.map((ing, i) => (
                                        <div key={i} className="compare-item">
                                            {ing.quantity} {ing.unit} {ing.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="compare-column">
                                <h4>v{selectedVersion.versionNumber}</h4>
                                <div className="compare-ingredients">
                                    {selectedVersion.ingredients?.map((ing, i) => (
                                        <div key={i} className="compare-item">
                                            {ing.quantity} {ing.unit} {ing.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VersionHistory;
