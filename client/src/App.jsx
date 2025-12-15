import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import RecipeEditor from './pages/RecipeEditor';
import VersionHistory from './pages/VersionHistory';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/catalog" /> : <Landing />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/catalog" /> : <Login />} />
                    <Route path="/register" element={isAuthenticated ? <Navigate to="/catalog" /> : <Register />} />
                    <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
                    <Route path="/edit/:recipeId" element={<ProtectedRoute><RecipeEditor /></ProtectedRoute>} />
                    <Route path="/history/:recipeId" element={<ProtectedRoute><VersionHistory /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
