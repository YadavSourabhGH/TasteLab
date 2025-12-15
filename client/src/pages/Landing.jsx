import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">🍳</span>
                        <span>Collaborative Cooking</span>
                    </div>
                    <h1 className="hero-title">
                        Cook Together,
                        <span className="gradient-text"> Create Magic</span>
                    </h1>
                    <p className="hero-subtitle">
                        TasteLab is a real-time collaborative recipe editor that lets you modify,
                        scale, and perfect recipes together with friends, family, or fellow food enthusiasts.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn btn-primary btn-large">
                            Start Cooking Together
                            <span className="btn-icon">→</span>
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-large">
                            Sign In
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <span className="card-emoji">🥗</span>
                        <span className="card-text">Caesar Salad</span>
                        <div className="card-users">
                            <div className="user-dot"></div>
                            <div className="user-dot"></div>
                            <span>2 editing</span>
                        </div>
                    </div>
                    <div className="floating-card card-2">
                        <span className="card-emoji">🍝</span>
                        <span className="card-text">Pasta Carbonara</span>
                        <div className="card-badge">v3.2</div>
                    </div>
                    <div className="floating-card card-3">
                        <span className="card-emoji">🍰</span>
                        <span className="card-text">Chocolate Cake</span>
                        <div className="card-change">+1.5 cups flour</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Why TasteLab?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Real-Time Collaboration</h3>
                        <p>Edit recipes simultaneously with collaborators. See changes as they happen with live cursor tracking.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📜</div>
                        <h3>Version History</h3>
                        <p>Track every modification with detailed version history. Compare versions and restore previous states.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚖️</div>
                        <h3>Scale & Modify</h3>
                        <p>Easily scale ingredient quantities and modify cooking steps while keeping the original as reference.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure Sharing</h3>
                        <p>Invite specific collaborators with role-based permissions. Control who can view or edit your recipes.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <h2 className="section-title">How It Works</h2>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Create a Recipe</h3>
                        <p>Start with a new recipe or import an existing one to your catalog.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Invite Collaborators</h3>
                        <p>Share your recipe with friends or colleagues who can help perfect it.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Cook Together</h3>
                        <p>Make changes in real-time, see each other's edits, and save versions.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to revolutionize your cooking?</h2>
                    <p>Join thousands of home chefs, culinary students, and food enthusiasts.</p>
                    <Link to="/register" className="btn btn-primary btn-large">
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="logo">🍳 TasteLab</span>
                        <p>Collaborative recipe editing for everyone.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                            <a href="#">Changelog</a>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2024 TasteLab. Made with ❤️ for food lovers.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
