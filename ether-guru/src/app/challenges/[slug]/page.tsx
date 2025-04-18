import React from "react";
import { challenges, getChallengeBySlug } from "@/lib/challenges";
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

// This is now a Server Component again
export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Fetch challenge data on the server
  const challenge = getChallengeBySlug((await params).slug);

  // Handle challenge not found on the server
  if (!challenge) {
    notFound();
  }

  // Render the Client Component, passing only serializable data (e.g., slug)
  // ChallengeDisplay will fetch the full data including the icon itself.
  return <ChallengeDisplay slug={(await params).slug} />;
}

// Optional: Metadata can also be generated on the server
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const challenge = getChallengeBySlug((await params).slug);
  return {
    title: `${challenge?.name || "Challenge"} - EtherGuru`,
    description:
      challenge?.description || "Solve an Ethernaut challenge on EtherGuru.",
  };
}
