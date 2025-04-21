"use client";

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    // Navigation is handled in the AuthForm component
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="signin" onSuccess={handleSuccess} />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
