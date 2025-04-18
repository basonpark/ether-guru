// src/components/ChallengeDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { getChallengeBySlug } from "@/lib/challenges"; // Removed unused Challenge type and challenges array
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react"; // Ensure React is imported for types

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"; // Re-adding the standard Button import
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import CodeEditor from '@/components/CodeEditor'; // Keep if needed later
import { Lightbulb, BookOpen, Eye } from "lucide-react"; // Import icons
// import { RainbowButton } from "@/components/ui/rainbow-button"; // Removed import

interface ChallengeDisplayProps {
  slug: string; // Accept slug instead of the full challenge object
}

export default function ChallengeDisplay({ slug }: ChallengeDisplayProps) {
  const [revealedHintContentIndices, setRevealedHintContentIndices] = useState<
    Set<number>
  >(new Set());
  const [userExplanation, setUserExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number | null;
    feedback: string | null;
  }>({ score: null, feedback: null });

  // Reset hints if the challenge (slug) prop changes - Moved up to fix hook rule
  useEffect(() => {
    setRevealedHintContentIndices(new Set()); // Also reset revealed content indices
    // if (challenge) setCode(challenge.vulnerableCode); // If using editor
  }, [slug]); // Depend on slug, as challenge might be undefined initially

  // Fetch challenge data based on slug
  const challenge = getChallengeBySlug(slug);

  // Defensive check if challenge data is not found for the slug
  // This might be redundant if page.tsx already uses notFound(), but good practice
  if (!challenge) {
    return <div>Challenge not found for slug: {slug}</div>;
  }

  // // Helper function for sidebar hover styles (Commented out - unused in this component)
  // const getSidebarHoverStyle = (difficulty: string | undefined) => {
  //   switch (difficulty?.toLowerCase()) {
  //     case "easy":
  //       return "hover:bg-slate-100 dark:hover:bg-slate-800";
  //     case "medium":
  //       return "hover:bg-slate-200 dark:hover:bg-slate-700";
  //     case "hard":
  //       return "hover:bg-slate-300 dark:hover:bg-slate-600";
  //     case "insane":
  //       return "hover:bg-slate-400 dark:hover:bg-slate-500";
  //     default:
  //       return "hover:bg-slate-100 dark:hover:bg-slate-800";
  //   }
  // };

  const handleSubmitExplanation = async () => {
    setIsSubmitting(true);
    setEvaluationResult({ score: null, feedback: null }); // Clear previous results

    try {
      const response = await fetch("/api/evaluate-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userExplanation: userExplanation,
          challengeSlug: slug,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        //handle API error
        console.error("API Error:", result);
        setEvaluationResult({
          score: 0,
          feedback: "Failed to evaluate explanation",
        });
      } else {
        //update state with score and feedback from API
        setEvaluationResult({
          score: result.score,
          feedback: result.feedback,
        });
      }
    } catch (error) {
      console.error("Error submitting explanation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setEvaluationResult({ score: null, feedback: null });
    setUserExplanation("");
  };

  // Custom renderers for ReactMarkdown
  const customRenderers: Components = {
    code(
      props: React.PropsWithChildren<{
        inline?: boolean;
        className?: string;
      }>
    ) {
      const { inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div">
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-slate-100 to-slate-400 dark:from-slate-950 dark:to-slate-900">
        {/* This div is now the main scrollable content area with the background */}
        {/* Challenge Header with Icon */}
        <div className="flex items-center mb-6">
          {challenge.icon && (
            <challenge.icon className="h-8 w-8 mr-3 text-primary flex-shrink-0" />
          )}
          <div>
            <h1 className="text-3xl font-bold dark:text-gray-100">
              {challenge.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* --- Main Content Area: Code + Submission --- */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6 mb-6">
          {/* Vulnerable Code Section */}
          <Card className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
              <CardTitle>Vulnerable Code</CardTitle>
              <CardDescription>
                Analyze the Solidity code below to find the vulnerability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Wrapper div for scrollable code */}
              <div className="code-scrollbar-wrapper max-h-[500px] overflow-y-auto rounded-md border dark:border-slate-700">
                <SyntaxHighlighter
                  language="solidity"
                  style={vscDarkPlus}
                  customStyle={{
                    // Removed border/padding here, handled by wrapper
                    margin: 0,
                    padding: "1rem", // Keep padding inside
                  }}
                  PreTag="div" // Use div for better styling control
                >
                  {challenge.vulnerableCode}
                </SyntaxHighlighter>
              </div>
            </CardContent>
          </Card>

          {/* Explanation Submission Section */}
          <Card className="lg:w-1/3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
              <CardTitle>Submit Explanation</CardTitle>
              <CardDescription>
                Explain the vulnerability and how to exploit it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="explanation">Your Explanation</Label>
                <Textarea
                  placeholder="You pass if your explanation scores 7/10 or above..."
                  id="explanation"
                  value={userExplanation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUserExplanation(e.target.value)
                  }
                  rows={8}
                />
              </div>
              <Button
                onClick={handleSubmitExplanation}
                disabled={isSubmitting || !userExplanation.trim()}
                className="w-full"
              >
                {isSubmitting ? "Evaluating..." : "Submit for Evaluation"}
              </Button>

              {evaluationResult.score !== null && (
                <div
                  className={`mt-4 p-3 rounded-md ${
                    evaluationResult.score >= 7
                      ? "bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"
                      : "bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700"
                  }`}
                >
                  <p className="font-semibold text-sm ${evaluationResult.score >= 7 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}">
                    Score: {evaluationResult.score} / 10
                  </p>
                  <p className="text-xs mt-1 ${evaluationResult.score >= 7 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}">
                    {evaluationResult.feedback}
                  </p>

                  {evaluationResult.score < 10 && (
                    <Button
                      onClick={handleTryAgain}
                      variant="outline"
                      className="mt-3 w-full"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hints Section - Use Card */}
        <Card className="mb-6 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Hints ({challenge.hints.length})
            </CardTitle>
            <CardDescription>Just a little peak</CardDescription>
          </CardHeader>
          <CardContent>
            {challenge.hints.length > 0 ? (
              <div className="flex flex-wrap justify-start gap-4">
                {challenge.hints.map((hint, index) => {
                  const cardStyle = getHintCardStyle(
                    index,
                    challenge.hints.length
                  );
                  return (
                    <Card
                      key={index}
                      className={`flex-1 min-w-[12rem] border-slate-300 dark:border-slate-700 flex flex-col ${cardStyle}`}
                    >
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Hint {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-center items-center pt-0">
                        {revealedHintContentIndices.has(index) ? (
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-2 w-full break-words text-left">
                            {hint}
                          </p>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mt-1 text-primary hover:text-primary/80 h-8 w-8"
                            onClick={() =>
                              setRevealedHintContentIndices((prev) =>
                                new Set(prev).add(index)
                              )
                            }
                            aria-label={`Reveal Hint ${index + 1}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No hints available for this challenge.
              </p>
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
            <CardDescription>Discomfort = Learning</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="explanation" className="border-b-0">
                <AccordionTrigger className="hover:no-underline justify-start gap-2 pt-0">
                  <span className="text-sm font-medium">View Explanation</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose dark:prose-invert max-w-none pt-2
                                    prose-headings:text-slate-800 dark:prose-headings:text-slate-200 
                                    prose-p:text-slate-700 dark:prose-p:text-slate-300 
                                    prose-a:text-primary hover:prose-a:text-primary/80 
                                    prose-strong:text-slate-800 dark:prose-strong:text-slate-200 
                                    prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                    prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 prose-blockquote:border-primary"
                  >
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
    </div>
  );
}

// Helper function to get gradient style for hint cards
const getHintCardStyle = (index: number, totalHints: number): string => {
  const intensity =
    totalHints > 1 ? Math.round((index / (totalHints - 1)) * 3) + 1 : 1; // Map index to 1-4 range (for slate-100 to 400)
  const bgLight = `bg-slate-${intensity * 100}`; // e.g., bg-slate-100, bg-slate-200
  const bgDark = `dark:bg-slate-${(9 - intensity) * 100}`; // e.g., dark:bg-slate-800, dark:bg-slate-700
  return `${bgLight} ${bgDark} shadow-md`;
};
