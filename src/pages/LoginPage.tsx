import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Código do operador: 3 a 20 letras ou números (ex.: 001, CAIXA2).
const CODIGO_VALIDO = /^[A-Za-z0-9]{3,20}$/;

export function LoginPage() {
  const [operatorCode, setOperatorCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = operatorCode.trim().toUpperCase();

    if (!CODIGO_VALIDO.test(code)) {
      setError('Use de 3 a 20 letras ou números, sem espaços.');
      return;
    }

    login(code);
    navigate('/pdv', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Click Shop PDV</h1>
        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <div>
            <label htmlFor="operator-code" className="block text-sm font-medium mb-1">
              Código do Operador
            </label>
            <input
              id="operator-code"
              type="text"
              value={operatorCode}
              onChange={(e) => {
                setOperatorCode(e.target.value);
                setError('');
              }}
              className="w-full p-3 border rounded-lg"
              placeholder="Ex.: 001"
              autoComplete="username"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'operator-code-error' : undefined}
              required
            />
            {error && (
              <p id="operator-code-error" role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
