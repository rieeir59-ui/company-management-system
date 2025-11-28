'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/context/UserContext';
import Header from '@/components/layout/header';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useFirebase } from '@/firebase/provider';
import { employees } from '@/lib/employees';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Firebase auth is not initialized.",
        });
        return;
    }

    const employee = employees.find(emp => emp.email === email);
    
    if (!employee) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'This email is not registered in the employee directory.',
        });
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle redirect and toast
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // If user doesn't exist, create them
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                // User will be auto-signed-in, onAuthStateChanged will handle the rest
            } catch (createError: any) {
                 toast({
                    variant: "destructive",
                    title: "Signup Failed",
                    description: createError.message,
                });
            }
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
        }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">Login</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
