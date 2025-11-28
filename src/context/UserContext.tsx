'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Employee, employees } from '@/lib/employees';
import { type User as FirebaseUser } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';

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
  const { auth } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
        setIsUserLoading(false);
        return;
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const employee = employees.find(e => e.email === firebaseUser.email);
            if (employee) {
                const loggedInUser = { ...employee, uid: firebaseUser.uid };
                setUser(loggedInUser);
                
                if (pathname === '/login') {
                  toast({
                      title: 'Login Successful',
                      description: `Welcome back, ${employee.name}!`,
                  });
                   if (['ceo', 'admin', 'software-engineer'].includes(employee.department)) {
                      router.push('/dashboard');
                  } else {
                      router.push('/employee-dashboard');
                  }
                }
            } else {
                setUser(null);
                auth.signOut();
            }
        } else {
            setUser(null);
        }
        setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, toast, pathname]);

  const login = (loggedInUser: Employee & { uid: string }) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    if (auth) {
        auth.signOut().then(() => {
             toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
            router.push('/login');
        });
    }
    setUser(null);
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
