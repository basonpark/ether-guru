"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from '../../../lib/supabase/client'; 
import { AuthError } from '@supabase/supabase-js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void; // Optional: Callback on success (e.g., close modal)
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let authError: AuthError | null = null;

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          // Optional: Add options like redirect URL if needed later
          // options: {
          //   emailRedirectTo: `${location.origin}/auth/callback`,
          // },
        });
        authError = error;
         if (!error) {
            // Maybe show a "Check your email" message for signup confirmation
            alert("Sign up successful! Check your email for verification."); // Simple feedback for now
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = error;
      }

      if (authError) {
        setError(authError.message);
      } else {
        // Sign-in/Sign-up successful (or email sent for verification)
        console.log(`${mode} successful for ${email}`);
        if (onSuccess) onSuccess(); // Call callback if provided
        // For now, no redirect or state change needed as auth isn't enforced
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'signin' ? 'Enter your credentials to access your account.' : 'Enter your email and password to sign up.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAuth}>
        <CardContent className="space-y-4">
          {error && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6} // Supabase default minimum
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
