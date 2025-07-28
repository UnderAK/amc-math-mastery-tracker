import { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  isGuest: boolean;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, value }: { children: ReactNode, value: AuthContextType }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
