import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string } | null;
}

interface AuthContextType extends AuthState {
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
  setOtpVerified: () => void;
  isOtpVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };
  });
  const [isOtpVerified, setIsOtpVerified] = useState(() => {
    return localStorage.getItem('otpVerified') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(state));
  }, [state]);

  const login = (user: { id: string; name: string }) => {
    setState({ isAuthenticated: true, user }); // 바로 인증 완료
    setIsOtpVerified(true);
    localStorage.setItem('otpVerified', 'true');
  };

  const setOtpVerified = () => {
    setIsOtpVerified(true);
    localStorage.setItem('otpVerified', 'true');
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const logout = () => {
    setState({ isAuthenticated: false, user: null });
    setIsOtpVerified(false);
    localStorage.removeItem('auth');
    localStorage.removeItem('otpVerified');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setOtpVerified, isOtpVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
