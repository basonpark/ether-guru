// src/components/ui/MobileNavBarWrapper.tsx
"use client";

import React from 'react';
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, Info, Code, Trophy } from 'lucide-react'; // Import necessary icons

// Define navItems inside the Client Component
const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'About', url: '/about', icon: Info },
  { name: 'Solidity', url: '/solidity', icon: Code }, // Placeholder URL
  { name: 'Hackathons', url: '/hackathons', icon: Trophy }, // Placeholder URL
];

export default function MobileNavBarWrapper() {
  // Render the NavBar for mobile (original fixed positioning will apply)
  // Apply classes needed for mobile layout (e.g., hiding on desktop)
  return <NavBar items={navItems} />; // No extra className needed if original styles are correct
}
