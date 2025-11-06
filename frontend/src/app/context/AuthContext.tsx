"use client"


import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    const fetchLoggedInStatus = async () => {
      try {
        const response = await fetch('https://veridoc.onrender.com/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log("pre : ", isPremium)
          setIsLoggedIn(data.success);
          setUserRole(data.userRole);
          setIsPremium(data.isPremium);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };
    fetchLoggedInStatus();
  }, [isPremium]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isPremium, setIsPremium, setIsLoggedIn, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
