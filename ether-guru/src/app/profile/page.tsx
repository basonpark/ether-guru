"use client";

import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useRouter } from "next/navigation"; // Import useRouter
import { createClient } from "../../../lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Profile interface for type safety
interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  last_login?: string;
  updated_at?: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Store full profile
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter(); // Initialize router

  // Function to update profile data specifically on sign-in event
  const updateProfileOnSignIn = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        console.log("Updating last_login for user:", userId);
        const { error } = await supabase
          .from("profiles")
          .update({
            last_login: new Date().toISOString(),
            // updated_at is handled by the database trigger/default value
          })
          .eq("id", userId);
        if (error) throw error;
      } catch (error) {
        console.error("Error updating profile on sign in:", error);
      }
    },
    [supabase]
  ); // Depend on supabase client

  // Function to load user and profile data
  const loadUserData = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (user) {
        console.log("User logged in:", user.email);
        setUser(user);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url") // Fetch avatar_url too
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // Ignore 'no rows found' error initially
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          // Fallback or handle case where profile might not exist yet (though trigger should handle it)
          console.warn("Profile not found for user:", user.id);
          // Optionally set profile state from metadata as fallback
          setProfile({
            id: user.id,
            first_name: user.user_metadata?.firstName,
            last_name: user.user_metadata?.lastName,
            avatar_url: user.user_metadata?.avatar_url,
          });
        }
      } else {
        console.log("No user logged in");
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null); // Ensure user state is null on error
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]); // Depend on supabase client

  // Load user data on mount and listen for auth state changes
  useEffect(() => {
    loadUserData(); // Initial load

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("Detected SIGNED_IN event");
        setUser(session.user); // Update user state immediately
        await loadUserData(); // Reload profile data
        await updateProfileOnSignIn(session.user.id); // ** Update profile ONLY on explicit sign-in **
      } else if (event === "SIGNED_OUT") {
        console.log("Detected SIGNED_OUT event");
        setUser(null);
        setProfile(null);
        router.push("/"); // Redirect to homepage on sign out using Next.js router
      } else if (event === "USER_UPDATED" && session?.user) {
        // Optionally reload data if user metadata might have changed
        console.log("Detected USER_UPDATED event");
        await loadUserData();
      }
      // Add handling for other events like TOKEN_REFRESHED if needed
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadUserData, updateProfileOnSignIn, router]); // Add dependencies

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true); // Optional: show loading during sign out
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // No need to redirect here, the onAuthStateChange listener handles it
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false); // Ensure loading is off on error
    }
  };

  // Go to profile page
  const goToProfile = () => {
    router.push("/profile"); // Use Next.js router
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Show loading state
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>;
  }

  // Show sign-in/sign-up buttons when not logged in
  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button size="sm" variant="outline" asChild>
          <a href="/signin" className="text-sm font-medium">
            {" "}
            {/* Keep as href or use Link */}
            Sign In
          </a>
        </Button>
        <Button size="sm" asChild>
          <a href="/signup" className="text-sm font-medium">
            {" "}
            {/* Keep as href or use Link */}
            Sign Up
          </a>
        </Button>
      </div>
    );
  }

  // Show profile button and sign out button when logged in
  const displayName = profile?.first_name || "User";
  const avatarSrc = profile?.avatar_url || user.user_metadata?.avatar_url || ""; // Prioritize profile avatar

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        className="flex items-center gap-2 py-1 px-2 rounded-full" // Added padding & rounding
        onClick={goToProfile}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <span className="font-medium hidden sm:inline">{displayName}</span>{" "}
        {/* Hide name on small screens */}
      </Button>

      <Button
        variant="outline"
        size="icon" // Make sign out an icon button
        onClick={handleSignOut}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full" // Rounded
        title="Sign out" // Add tooltip
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span> {/* Screen reader text */}
      </Button>
    </div>
  );
}
