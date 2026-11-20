import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/layout/Header';
import { PdvPage } from './pages/PdvPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/ProtectedRoute';

// No GitHub Pages o app vive em /click-shop-pdv/ (BASE_URL vem do vite.config.ts).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/pdv"
              element={
                <ProtectedRoute>
                  <PdvPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
