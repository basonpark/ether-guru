"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "../../lib/supabase"; // Adjust path if needed
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import SignInDialog from "./SignInDialog";
import SignUpDialog from "./SignUpDialog";

// Simple Profile type - adjust if your 'profiles' table has different columns
interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendStatus, setResendStatus] = useState<string | null>(null); // State for resend feedback
  // Memoize the client instance
  const supabase = useMemo(() => createClient(), []);

  // Initial state log
  console.log("[UserProfile] Initial state:", { loading, user, profile });

  // Fetch profile based on user ID
  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .eq("id", userId)
          .single(); // Use .single() if a profile is guaranteed by a trigger

        // Log profile fetch attempt
        console.log("[UserProfile] fetchProfile result:", { data, error });

        if (error) {
          // Handle cases where profile might not exist yet or other errors
          console.warn(`Could not fetch profile for ${userId}:`, error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
      }
    },
    [supabase]
  );

  // Effect to listen for auth changes and fetch initial user/profile
  useEffect(() => {
    console.log("[UserProfile] useEffect: Setting up auth listener.");
    setLoading(true);

    // Immediately check for an existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log("[UserProfile] useEffect: Initial session check:", session);
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false); // Set loading false after session check completes
        setResendStatus(null); // Clear resend status on session load/change
      })
      .catch((error) => {
        console.error(
          "[UserProfile] useEffect: Error during getSession():",
          error
        );
        setUser(null);
        setProfile(null);
        setLoading(false); // Ensure loading is set to false even on error
        setResendStatus(null);
      });

    // Listen for future auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log(
          "[UserProfile] onAuthStateChange event:",
          _event,
          "session:",
          session
        );
        setResendStatus(null); // Clear resend status on auth change
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        // Optionally set loading false here too, or manage it within fetchProfile
        // setLoading(false); // Might cause flicker if fetchProfile is slow
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log("[UserProfile] useEffect: Cleaning up auth listener.");
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Resend confirmation email handler
  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    setResendStatus("Sending...");
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      setResendStatus("Confirmation email sent!");
    } catch (error: any) {
      console.error("Error resending confirmation email:", error);
      setResendStatus(`Error: ${error.message || 'Could not send email.'}`);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    // Auth listener will handle setting user/profile to null
  };

  // Get initials for avatar fallback
  const getInitials = (
    profile?: Profile | null,
    email?: string | null
  ): string => {
    const firstName = profile?.first_name;
    const lastName = profile?.last_name;

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Final state log before render
  console.log("[UserProfile] Rendering with state:", {
    loading,
    user,
    profile,
  });

  // Display loading state
  if (loading) {
    // Simple loading indicator
    return <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div>;
  }

  // If user exists but email is not confirmed
  if (user && !user.email_confirmed_at) {
    console.log("[UserProfile] User exists but email not confirmed:", user.email);
    return (
      <div className="flex flex-col items-center space-y-1 text-center text-xs px-2">
        <p>Please confirm your email ({user.email}).</p>
        <Button
          variant="link"
          size="sm"
          onClick={handleResendConfirmation}
          disabled={resendStatus === "Sending..." || resendStatus === "Confirmation email sent!"}
          className="h-auto p-0 text-xs"
        >
          Resend Confirmation Email
        </Button>
        {resendStatus && (
          <p className={`text-xs ${resendStatus.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {resendStatus}
          </p>
        )}
        {/* Allow sign out even if unconfirmed */}
        <Button variant="outline" size="sm" onClick={handleSignOut} className="mt-1">
          Sign Out
        </Button>
      </div>
    );
  }

  // If no user, show Sign In and Sign Up buttons
  if (!user) {
    console.log("[UserProfile] No user, rendering Sign In/Up buttons.");
    return (
      <div className="flex items-center space-x-2">
        <SignInDialog>
          {/* Sign In Button Styling */}
          <Button 
            variant="outline" // Use outline as a base
            size="sm"
            className="border-primary/50 text-primary hover:bg-primary/10 shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200"
            >
            Sign In
          </Button>
        </SignInDialog>
        <SignUpDialog>
          {/* Sign Up Button Styling - Gradient */}
          <Button 
            variant="default" // Keep default base for structure
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-95 shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200"
            >
            Sign Up
          </Button>
        </SignUpDialog>
      </div>
    );
  }

  // --- Render Logic --- Only reached if user exists and email is confirmed
  // Logged In State: Prepare display data
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  // Construct full name, fallback to first name, fallback to email
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || user.email || "User";
  const avatarUrl = profile?.avatar_url || ""; // Add fallback if needed

  return (
    <div className="flex items-center gap-3">
      {/* You can make this a dropdown menu later if needed */}
      <Button
        variant="ghost"
        className="p-1 rounded-full h-8 w-8"
        title={displayName}
      >
        <Avatar className="h-full w-full">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} alt={displayName ?? "User"} />
          )}
          <AvatarFallback>{getInitials(profile, user.email)}</AvatarFallback>
        </Avatar>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
