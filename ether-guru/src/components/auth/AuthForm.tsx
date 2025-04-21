"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { createClient } from "../../../lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void; // Optional: Callback on success (e.g., close modal)
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const supabase = createClient();

  // Password validation for signup
  const passwordsMatch = mode === "signin" || password === confirmPassword;
  const passwordError = !passwordsMatch ? "Passwords don't match" : null;

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match for signup
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      let authError: AuthError | null = null;

      if (mode === "signup") {
        // Get the current origin for redirect URL
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Add redirect URL for email verification
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
              firstName,
              lastName,
              full_name: `${firstName} ${lastName}`,
            },
          },
        });

        authError = error;

        // If signup is successful, store user profile info
        if (!error && data?.user) {
          // Show verification dialog
          setIsVerificationModalOpen(true);
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
      } else if (mode === "signin") {
        // Sign-in successful
        console.log(`${mode} successful for ${email}`);
        if (onSuccess) onSuccess(); // Call callback if provided
        window.location.href = "/profile"; // Redirect to profile page instead of homepage
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification confirmation modal
  const VerificationModal = () => (
    <Dialog
      open={isVerificationModalOpen}
      onOpenChange={setIsVerificationModalOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Check your email
          </DialogTitle>
          <DialogDescription>
            We've sent a verification link to <strong>{email}</strong>. Please
            check your inbox and click the link to verify your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsVerificationModalOpen(false);
              window.location.href = "/profile"; // Redirect to profile page after closing
            }}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Card className="w-full max-w-sm border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Enter your credentials to access your account."
              : "Enter your information to sign up."}
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

            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                disabled={isLoading}
              />
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                  disabled={isLoading}
                  className={!passwordsMatch ? "border-red-500" : ""}
                />
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (mode === "signup" && !passwordsMatch)}
            >
              {isLoading
                ? "Processing..."
                : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <VerificationModal />
    </>
  );
}
