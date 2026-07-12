import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { operatorCode, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Click Shop PDV</h1>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Operador: <strong>{operatorCode}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
