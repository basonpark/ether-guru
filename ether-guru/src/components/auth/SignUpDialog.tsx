"use client";

import { useState, PropsWithChildren } from "react";
import { createClient } from "../../lib/supabase"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignUpDialog({ children }: PropsWithChildren) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For success messages
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      setError(signUpError.message || "An unexpected error occurred.");
    } else if (data.user && data.user.identities?.length === 0) {
      setError(
        "User already exists but is unconfirmed. Please check your email to confirm."
      );
    } else if (data.session) {
      setMessage("Sign up successful! You are now logged in.");
      setTimeout(() => setOpen(false), 1500);
    } else if (data.user) {
      setMessage(
        "Sign up successful! Please check your email to confirm your account."
      );
    } else {
      setError("An unexpected issue occurred during sign up.");
    }

    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setError(null);
      setMessage(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create your account by providing an email and password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignUp}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {/* Only show form inputs if there's no success message */}
            {!message && (
              <>
                {/* First Name Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first-name-signup" className="text-right">
                    First Name
                  </Label>
                  <Input
                    id="first-name-signup"
                    type="text"
                    placeholder="Ether"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
                {/* Last Name Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last-name-signup" className="text-right">
                    Last Name
                  </Label>
                  <Input
                    id="last-name-signup"
                    type="text"
                    placeholder="Guruson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    // required
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
                {/* Email Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-signup" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
                {/* Password Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password-signup" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
                {/* Confirm Password Input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirm-password-signup" className="text-right">
                    Confirm
                  </Label>
                  <Input
                    id="confirm-password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="col-span-3"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>
          {/* Only show footer buttons if no success message or still loading */}
          {!message && (
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
