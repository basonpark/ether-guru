// src/components/ChallengeDisplay.tsx
'use client';

import { useState, useEffect } from "react";
import { Challenge, challenges, getChallengeBySlug } from "@/lib/challenges"; // Import challenges array and getChallengeBySlug
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react'; // Ensure React is imported for types

import {
  Card,
  CardContent,
  CardDescription,
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
import { Lightbulb, BookOpen, Eye } from 'lucide-react'; // Import icons

interface ChallengeDisplayProps {
  slug: string; // Accept slug instead of the full challenge object
}

export default function ChallengeDisplay({ slug }: ChallengeDisplayProps) {
  const [revealedHintContentIndices, setRevealedHintContentIndices] = useState<Set<number>>(new Set());
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
      setRevealedHintContentIndices(new Set()); // Also reset revealed content indices
      // if (challenge) setCode(challenge.vulnerableCode); // If using editor
  }, [challenge]); // Depend on the fetched challenge object

  const customRenderers: Components = {
    code(props: React.PropsWithChildren<{ inline?: boolean; className?: string; node?: any }>) {
      const { node, inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
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

  // Helper function to get gradient style for hint cards
  const getHintCardStyle = (index: number, totalHints: number): string => {
    const intensity = totalHints > 1 ? Math.round((index / (totalHints - 1)) * 3) + 1 : 1; // Map index to 1-4 range (for slate-100 to 400)
    const bgLight = `bg-slate-${intensity * 100}`; // e.g., bg-slate-100, bg-slate-200
    const bgDark = `dark:bg-slate-${(9 - intensity) * 100}`; // e.g., dark:bg-slate-800, dark:bg-slate-700
    return `${bgLight} ${bgDark} shadow-md`;
  };

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] overflow-hidden"> {/* Main flex container */}
      {/* Main Content Section - Add gradient and padding */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Challenge Header with Icon */}
        <div className="flex items-center mb-6">
          {challenge.icon && <challenge.icon className="h-8 w-8 mr-3 text-primary flex-shrink-0" />} 
          <div>
              <h1 className="text-3xl font-bold dark:text-gray-100">{challenge.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{challenge.description}</p>
          </div>
        </div>

        {/* Vulnerable Code Section - Consider adding label */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Vulnerable Code Snippet</h3>
          <SyntaxHighlighter language="solidity" style={vscDarkPlus} customStyle={{ borderRadius: '0.5rem', padding: '1rem', margin: 0 }}>
            {challenge.vulnerableCode}
          </SyntaxHighlighter>
        </div>

        {/* Hints Section - Use Card */}
        <Card className="mb-6 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800">
          <CardHeader>
              <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Hints ({challenge.hints.length})
              </CardTitle>
              <CardDescription>Need a little help? Reveal hints individually.</CardDescription>
          </CardHeader>
          <CardContent>
            {challenge.hints.length > 0 ? (
              <div className="flex flex-wrap justify-start gap-4">
                {challenge.hints.map((hint, index) => {
                  const cardStyle = getHintCardStyle(index, challenge.hints.length);
                  return (
                  <Card key={index} className={`flex-1 min-w-[12rem] border-slate-300 dark:border-slate-700 flex flex-col ${cardStyle}`}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">Hint {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center items-center pt-0">
                      {revealedHintContentIndices.has(index) ? (
                        <p className="text-sm text-slate-700 dark:text-slate-300 py-2 w-full break-words text-center">{hint}</p>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="mt-1 text-primary hover:text-primary/80 h-8 w-8"
                          onClick={() => setRevealedHintContentIndices(prev => new Set(prev).add(index))}
                          aria-label={`Reveal Hint ${index + 1}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                 )}
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No hints available for this challenge.</p>
            )}
          </CardContent>
        </Card>

        {/* Explanation Section - Use Card */}
        <Card className="mb-6 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Explanation
                </CardTitle>
                <CardDescription>Understand the concepts behind the vulnerability.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="explanation" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline justify-start gap-2 pt-0">
                    <span className="text-sm font-medium">View Explanation</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose dark:prose-invert max-w-none pt-2
                                    prose-headings:text-slate-800 dark:prose-headings:text-slate-200 
                                    prose-p:text-slate-700 dark:prose-p:text-slate-300 
                                    prose-a:text-primary hover:prose-a:text-primary/80 
                                    prose-strong:text-slate-800 dark:prose-strong:text-slate-200 
                                    prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                    prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 prose-blockquote:border-primary">
                        <ReactMarkdown
                          components={customRenderers}
                          remarkPlugins={[remarkGfm]}
                        >
                          {challenge.explanation}
                        </ReactMarkdown>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
        </Card>

        {/* Navigation Buttons - Consider styling */}
        <div className="flex justify-between mt-8">
          {/* Navigation buttons will go here */}
        </div>
      </main>
    </div>
  );
}
