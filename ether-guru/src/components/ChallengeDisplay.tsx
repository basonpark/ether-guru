// src/components/ChallengeDisplay.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { getChallengeBySlug } from "@/lib/challenges";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, BookOpen, Eye } from "lucide-react";
import { Mic, MicOff } from "lucide-react";

interface ChallengeDisplayProps {
  slug: string;
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      console.log("Interim:", interimTranscript, "Final:", finalTranscript);
      if (finalTranscript) {
        setUserExplanation((prev) =>
          prev
            ? `${prev.trim()} ${finalTranscript.trim()}`
            : finalTranscript.trim()
        );
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setEvaluationResult({
        score: 0,
        feedback: `Speech Error: ${event.error}`,
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        console.log("Stopped speech recognition on unmount.");
      }
    };
  }, [isListening]);

  const handleListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setEvaluationResult({ score: null, feedback: null });
      } catch (error) {
        console.error("Could not start speech recognition:", error);
        setEvaluationResult({
          score: 0,
          feedback: "Could not start listening. Check microphone permissions.",
        });
      }
    }
  };

  const handleSubmitExplanation = async () => {
    setIsSubmitting(true);
    setEvaluationResult({ score: null, feedback: null });

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
        console.error("API Error:", result);
        setEvaluationResult({
          score: 0,
          feedback: "Failed to evaluate explanation",
        });
      } else {
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

  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    return <div>Challenge not found for slug: {slug}</div>;
  }

  useEffect(() => {
    setRevealedHintContentIndices(new Set());
  }, [slug]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-slate-100 to-slate-400 dark:from-slate-950 dark:to-slate-900">
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

      <div className="flex flex-col lg:flex-row gap-6 mt-6 mb-6">
        <Card className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle>Vulnerable Code</CardTitle>
            <CardDescription>
              Analyze the Solidity code below to find the vulnerability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="code-scrollbar-wrapper max-h-[500px] overflow-y-auto rounded-md border dark:border-slate-700">
              <SyntaxHighlighter
                language="solidity"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                }}
                PreTag="div"
              >
                {challenge.vulnerableCode}
              </SyntaxHighlighter>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:w-1/3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle>Submit Explanation</CardTitle>
            <CardDescription>
              Explain the vulnerability and how to exploit it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-1.5">
              {/* Relative container for Textarea and absolute button */}
              <div className="relative w-full">
                <Label htmlFor="explanation" className="mb-1.5 block">
                  Your Explanation
                </Label>
                <Textarea
                  placeholder={
                    isListening
                      ? "Listening... Explain the vulnerability..."
                      : "Score a 7/10 or higher to pass..."
                  }
                  id="explanation"
                  value={userExplanation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUserExplanation(e.target.value)
                  }
                  rows={8}
                  className="w-full resize-none pr-10 pb-2 whitespace-normal break-all" // Ensure wrapping
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleListen}
                  // Absolute positioning classes
                  className={`absolute bottom-2 right-2 ${
                    isListening
                      ? "text-red-500 border-red-500"
                      : "text-muted-foreground"
                  }`}
                  title={isListening ? "Stop Listening" : "Start Voice Input"}
                  disabled={isSubmitting}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
                <span className="text-sm font-medium">Unveil Explanation</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose dark:prose-invert max-w-none pt-2 prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 prose-blockquote:border-primary">
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

      <div className="flex justify-between mt-8">
        {/* Navigation buttons will go here */}
      </div>
    </div>
  );
}

const getHintCardStyle = (index: number, totalHints: number): string => {
  const intensity =
    totalHints > 1 ? Math.round((index / (totalHints - 1)) * 3) + 1 : 1;
  const bgLight = `bg-slate-${intensity * 100}`;
  const bgDark = `dark:bg-slate-${(9 - intensity) * 100}`;
  return `${bgLight} ${bgDark} shadow-md`;
};
