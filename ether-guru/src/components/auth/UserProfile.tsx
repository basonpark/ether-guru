"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignInDialog from "./SignInDialog";
import SignUpDialog from "./SignUpDialog";

// Profile interface for type safety
interface Profile {
  id: string;
  first_name?: string | null; // Allow null
  last_name?: string | null; // Allow null
  avatar_url?: string | null; // Allow null
  // Add other fields if needed later
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Use a profile state
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter(); // Initialize router

  // --- How to Log Out User ---
  // The core function is supabase.auth.signOut()
  const handleSignOut = async () => {
    setLoading(true); // Optional: Show loading indicator during sign out
    try {
      const { error } = await supabase.auth.signOut(); // This is the key call
      if (error) {
        console.error("Error signing out:", error);
        setLoading(false); // Stop loading on error
      }
      // No need to manually redirect or clear state here.
      // The onAuthStateChange listener will detect SIGNED_OUT
      // and update the state (setUser(null), setProfile(null)),
      // causing the component to re-render in the logged-out view.
      // It will also trigger the router.push('/') defined in the listener.
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      setLoading(false);
    }
    // setLoading will be set to false again by the loadUserData call triggered by SIGNED_OUT event
  };

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
          })
          .eq("id", userId);
        if (error) throw error;
      } catch (error) {
        console.error("Error updating profile on sign in:", error);
      }
    },
    [supabase]
  );

  // Function to load user and profile data
  const loadUserData = useCallback(async () => {
    try {
      // 1. Get User
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      // Log detailed user information
      console.log("========== USER INFORMATION ==========");
      console.log("User object:", user);
      console.log("User email:", user?.email);
      console.log("User ID:", user?.id);
      console.log("User metadata:", user?.user_metadata);
      console.log("====================================");

      if (authError) {
        console.error("Error fetching user:", authError);
        throw authError;
      }

      if (user) {
        console.log("User logged in:", user.email);
        setUser(user);

        // 2. Get Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        // Log detailed profile information
        console.log("========== PROFILE INFORMATION ==========");
        console.log("Profile data:", profileData);
        console.log("Profile error:", profileError);
        console.log("First name:", profileData?.first_name);
        console.log("Last name:", profileData?.last_name);
        console.log("Avatar URL:", profileData?.avatar_url);
        console.log("=========================================");

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Don't throw here, allow fallback to metadata or default display
          setProfile(null); // Ensure profile state is null if fetch fails
        } else {
          setProfile(profileData); // Set profile state (will be null if not found)
          console.log("Profile data fetched:", profileData);
        }
      } else {
        // No user logged in
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null); // Clear state on unexpected errors
      setProfile(null);
    } finally {
      setLoading(false); // Ensure loading stops
    }
  }, [supabase]);

  // Load user data on mount and listen for auth state changes
  useEffect(() => {
    // Initial data load
    loadUserData();
    console.log("Initial loadUserData called");

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (event === "SIGNED_IN" && session?.user) {
        console.log(" User signed in:", session.user.email);
        console.log("User metadata:", session.user.user_metadata);
        await loadUserData();
        await updateProfileOnSignIn(session.user.id);
      } else if (event === "SIGNED_OUT") {
        console.log(" User signed out");
        setUser(null);
        setProfile(null);
        // No router push needed if using window.location
      } else if (event === "INITIAL_SESSION") {
        // Handled by the initial loadUserData call
        console.log("Detected INITIAL_SESSION");
        // loadUserData will set loading false
      } else if (event === "USER_UPDATED" && session?.user) {
        console.log("Detected USER_UPDATED event");
        await loadUserData(); // Reload data if user info might have changed
      } else {
        // Handle other events or just stop loading if nothing else matched
        if (user === null && profile === null) setLoading(false); // Stop loading if state is cleared but no specific event matched needed action
      }
      // setLoading(false) // Moved to specific event handlers or finally block in loadUserData
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
    // Removed loadUserData, updateProfileOnSignIn from dependencies as they are wrapped in useCallback
    // Router is stable, supabase client assumed stable
  }, [supabase, updateProfileOnSignIn, loadUserData, router]);

  // Go to profile page action
  const goToProfile = () => {
    router.push("/profile"); // Use Next.js router
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    // Prioritize profile name
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    // Fallback to user metadata name (if you store it there)
    if (user?.user_metadata?.firstName) {
      return user.user_metadata.firstName.charAt(0).toUpperCase();
    }
    // Fallback to email
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // Absolute fallback
  };

  // --- RENDER LOGIC ---

  // 1. Loading State
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>;
  }

  // 2. Logged Out State
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <SignInDialog>
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </SignInDialog>
        <SignUpDialog>
          <Button variant="default" size="sm">
            Sign Up
          </Button>
        </SignUpDialog>
      </div>
    );
  }

  // 3. Logged In State (user is not null)
  // Prepare display values with fallbacks
  const displayName =
    profile?.first_name || user?.user_metadata?.firstName || "User";
  // Prioritize profile avatar, then metadata avatar
  const avatarSrc =
    profile?.avatar_url || user?.user_metadata?.avatar_url || "";

  console.log("Rendering logged-in state with:", {
    user: user?.email,
    displayName,
    avatarSrc,
    hasProfile: !!profile,
  });

  return (
    <div className="flex items-center gap-3">
      {" "}
      {/* Adjust gap as needed */}
      {/* Profile Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 py-1 px-2 rounded-full" // Style as needed
        onClick={goToProfile}
        title="Go to profile"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        {/* Conditionally hide name on smaller screens if desired */}
        <span className="font-medium hidden sm:inline">{displayName}</span>
      </Button>
      {/* Sign Out Button */}
      <Button
        variant="outline" // Or destructive, ghost, etc.
        size="icon" // Use icon size for just the LogOut symbol
        onClick={handleSignOut}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full" // Style as needed
        title="Sign out" // Tooltip
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
}
