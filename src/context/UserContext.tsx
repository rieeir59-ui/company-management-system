'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Employee, employees } from '@/lib/employees';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  user: (Employee & { uid: string }) | null;
  isUserLoading: boolean;
  login: (user: Employee & { uid: string }) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(Employee & { uid: string }) | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking for a logged-in user
    // In a real app, you might check localStorage or a cookie
    setIsUserLoading(false); 
  }, []);

  const login = (loggedInUser: Employee & { uid: string }) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, isUserLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};
