// src/components/ChallengeDisplay.tsx
'use client';

import { useState, useEffect } from "react";
import { Challenge, challenges, getChallengeBySlug } from "@/lib/challenges"; // Import challenges array and getChallengeBySlug
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react'; // Ensure React is imported for types

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
// import CodeEditor from '@/components/CodeEditor'; // Keep if needed later

interface ChallengeDisplayProps {
  slug: string; // Accept slug instead of the full challenge object
}

export default function ChallengeDisplay({ slug }: ChallengeDisplayProps) {
  const [revealedHints, setRevealedHints] = useState<number>(0);
  // Fetch challenge data based on slug
  const challenge = getChallengeBySlug(slug);

  // Defensive check if challenge data is not found for the slug
  // This might be redundant if page.tsx already uses notFound(), but good practice
  if (!challenge) {
    return <div>Challenge not found for slug: {slug}</div>;
  }

  // Helper function for sidebar hover styles
  const getSidebarHoverStyle = (difficulty: string | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'hover:bg-slate-100 dark:hover:bg-slate-800';
      case 'medium': return 'hover:bg-slate-200 dark:hover:bg-slate-700';
      case 'hard': return 'hover:bg-slate-300 dark:hover:bg-slate-600';
      case 'insane': return 'hover:bg-slate-400 dark:hover:bg-slate-500';
      default: return 'hover:bg-slate-100 dark:hover:bg-slate-800';
    }
  };

  // Reset hints if the challenge (slug) prop changes
  useEffect(() => {
      setRevealedHints(0);
      // if (challenge) setCode(challenge.vulnerableCode); // If using editor
  }, [challenge]); // Depend on the fetched challenge object

  const handleShowHint = () => {
    if (revealedHints < challenge.hints.length) {
      setRevealedHints(revealedHints + 1);
    }
  };

  const customRenderers: Components = {
    code(props: React.PropsWithChildren<{ inline?: boolean; className?: string; node?: any }>) {
      const { node, inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{challenge.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            Difficulty: {challenge.difficulty}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 dark:text-gray-200">
            {challenge.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vulnerable Code</CardTitle>
        </CardHeader>
        <CardContent>
          <SyntaxHighlighter
            language="solidity"
            style={atomDark}
            customStyle={{
              borderRadius: '0.5rem',
              padding: '1rem',
              margin: '0',
              fontSize: '0.9rem',
              overflowX: 'auto',
            }}
             codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
            wrapLongLines={true}
          >
            {challenge.vulnerableCode.trim()}
          </SyntaxHighlighter>
          {/* Code Editor placeholder */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hints</CardTitle>
        </CardHeader>
        <CardContent>
          {challenge.hints.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {challenge.hints.slice(0, revealedHints).map((hint, index) => (
                <AccordionItem value={`item-${index + 1}`} key={index}>
                  <AccordionTrigger>Hint #{index + 1}</AccordionTrigger>
                  <AccordionContent>{hint}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">
              No hints available for this challenge.
            </p>
          )}
        </CardContent>
        {revealedHints < challenge.hints.length && (
          <CardFooter>
            <Button onClick={handleShowHint} variant="outline">
              Reveal Next Hint ({revealedHints + 1}/{challenge.hints.length})
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="explanation">
              <AccordionTrigger>View Explanation</AccordionTrigger>
              <AccordionContent>
                {/* Wrap ReactMarkdown to apply prose styling */}
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={customRenderers}
                  >
                    {challenge.explanation}
                  </ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
