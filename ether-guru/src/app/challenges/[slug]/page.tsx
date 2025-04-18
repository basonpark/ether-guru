import React from 'react';
import { challenges, getChallengeBySlug, Challenge } from "@/lib/challenges";
import { notFound } from "next/navigation";
import ChallengeDisplay from "@/components/ChallengeDisplay"; // Import the new client component

// Generate static paths for all challenges
// This remains a server-side function
export async function generateStaticParams() {
  // Ensure challenges is imported correctly for build time
  const challengeData = challenges; // Directly use imported data if static
  return challengeData.map((challenge) => ({
    slug: challenge.slug,
  }));
}

interface ChallengePageProps {
  params: {
    slug: string;
  };
}

// This is now a Server Component again
export default function ChallengePage({ params }: ChallengePageProps) {
  // Fetch challenge data on the server
  const challenge = getChallengeBySlug(params.slug);

  // Handle challenge not found on the server
  if (!challenge) {
    notFound();
  }

  // Render the Client Component, passing only serializable data (e.g., slug)
  // ChallengeDisplay will fetch the full data including the icon itself.
  return <ChallengeDisplay slug={params.slug} />; 
}

// Optional: Metadata can also be generated on the server
export async function generateMetadata({ params }: ChallengePageProps) {
  const challenge = getChallengeBySlug(params.slug);
  return {
    title: `${challenge?.name || 'Challenge'} - EtherGuru`,
    description: challenge?.description || 'Solve an Ethernaut challenge on EtherGuru.',
  };
}
