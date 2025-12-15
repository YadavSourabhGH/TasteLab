function UserPresence({ users }) {
    if (!users || users.length === 0) {
        return null;
    }

    return (
        <div className="user-presence">
            <div className="presence-avatars">
                {users.slice(0, 4).map((user, index) => (
                    <div
                        key={user.id || index}
                        className="presence-avatar"
                        style={{
                            zIndex: users.length - index,
                            backgroundColor: getColorForUser(user.id || index)
                        }}
                        title={`${user.name}${user.activeSection ? ` - editing ${user.activeSection}` : ''}`}
                    >
                        {user.name?.charAt(0).toUpperCase() || '?'}
                        {user.activeSection && (
                            <span className="editing-indicator"></span>
                        )}
                    </div>
                ))}
                {users.length > 4 && (
                    <div className="presence-more">
                        +{users.length - 4}
                    </div>
                )}
            </div>
            <span className="presence-text">
                {users.length} {users.length === 1 ? 'editor' : 'editors'}
            </span>
        </div>
    );
}

// Generate consistent color for user
function getColorForUser(id) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8B500', '#48C9B0'
    ];

    if (typeof id === 'number') {
        return colors[id % colors.length];
    }

    const hash = String(id).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
}

export default UserPresence;
