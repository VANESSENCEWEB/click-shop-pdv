import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  operatorCode: string | null;
  isAuthenticated: boolean;
  login: (code: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operatorCode, setOperatorCode] = useState<string | null>(
    () => localStorage.getItem('operatorCode')
  );

  const login = (code: string) => {
    localStorage.setItem('operatorCode', code);
    setOperatorCode(code);
  };

  const logout = () => {
    localStorage.removeItem('operatorCode');
    setOperatorCode(null);
  };

  return (
    <AuthContext.Provider
      value={{
        operatorCode,
        isAuthenticated: operatorCode !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
