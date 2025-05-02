"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Expand, X } from 'lucide-react'; // Import Expand and X icons
import useLocalStorageState from '@/hooks/useLocalStorageState'; // Import the custom hook

// Define the structure for a chat message
interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean; // Flag to indicate if the bot message is still typing
}

// Define props for ChatInterface
interface ChatInterfaceProps {
  onExpand?: () => void; // Optional callback for expand button
  onMinimize?: () => void; // Optional callback for minimize button
}

const thinkingPhrases = [
  "Thinking...",
  "Consulting the Solidity docs...",
  "Generating response...",
  "Almost there...",
  "Let me check that...",
];
const TYPING_SPEED_MS = 5; // Milliseconds per character

export function ChatInterface({ onExpand, onMinimize }: ChatInterfaceProps) {
  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>('etherGuruChatMessages', []);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState(
    thinkingPhrases[0]
  );
  const [hasMounted, setHasMounted] = useState(false); // State to track client mount
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effect to set hasMounted after client mount ---
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // --- Effect for Initial Greeting ---
  useEffect(() => {
    // Only run on client after mount and if messages are truly empty
    if (hasMounted && messages.length === 0) { 
      const timer = setTimeout(() => {
        const initialMessage: ChatMessage = {
          sender: "bot",
          text: "", // Start empty for typing effect
          isTyping: true,
        };
        setMessages([initialMessage]);
        startTypingEffect(
          initialMessage,
          "What would you like to know about Solidity?", // Updated initial message
          0
        );
      }, 500); // Slightly shorter delay before initial message appears
      return () => clearTimeout(timer);
    }
  }, [hasMounted]); // Depend only on hasMounted to ensure it runs once correctly

  // --- Effect for Cycling Thinking Phrases ---
  useEffect(() => {
    if (isLoading) {
      let phraseIndex = 0;
      setCurrentThinkingPhrase(thinkingPhrases[phraseIndex]); // Set initial phrase immediately
      thinkingIntervalRef.current = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % thinkingPhrases.length;
        setCurrentThinkingPhrase(thinkingPhrases[phraseIndex]);
      }, 2000); // Change phrase every 2 seconds
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    }
    // Cleanup on unmount or when isLoading changes
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [isLoading]);

  // --- Function to Scroll To Bottom ---
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const scrollableViewport = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollableViewport) {
          scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
      }, 50); // Small delay to allow rendering
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // --- Typing Effect Logic ---
  const startTypingEffect = useCallback(
    (targetMessage: ChatMessage, fullText: string, messageIndex: number) => {
      let currentText = "";
      let charIndex = 0;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current); // Clear any existing typing interval
      }

      typingIntervalRef.current = setInterval(() => {
        if (charIndex < fullText.length) {
          currentText += fullText[charIndex];
          // Update the specific message in the array
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            // Ensure the message still exists at the index
            if (updatedMessages[messageIndex]) {
              updatedMessages[messageIndex] = {
                ...targetMessage,
                text: currentText,
                isTyping: true,
              };
            }
            return updatedMessages;
          });
          charIndex++;
          scrollToBottom(); // Scroll as text grows
        } else {
          // Typing finished
          if (typingIntervalRef.current)
            clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          // Mark the message as finished typing
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            if (updatedMessages[messageIndex]) {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                isTyping: false,
              };
            }
            return updatedMessages;
          });
        }
      }, TYPING_SPEED_MS);
    },
    [scrollToBottom, setMessages] // Added setMessages
  ); // Include scrollToBottom in dependencies

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // --- Send Message Handler ---
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return; // Only return if input is empty

    // --- Clear Chat Command --- 
    if (trimmedInput.toLowerCase() === 'clear') {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      setMessages([]); // Clear messages state (and local storage via hook)
      setInputValue(''); // Clear input field
      setIsLoading(false); // Ensure loading state is reset
      return; // Stop processing
    }
    // --- End Clear Chat Command ---

    // Prevent sending normal messages if loading or typing
    if (isLoading || messages.some((m) => m.isTyping)) return;

    const newUserMessage: ChatMessage = {
      sender: "user",
      text: trimmedInput,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/query-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedInput }),
      });

      setIsLoading(false); // Stop loading indicator earlier

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        sender: "bot",
        text: "",
        isTyping: true,
      }; // Start empty
      // Add the placeholder message first
      const newMessageIndex = messages.length + 1; // Index where the new message will be
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      // Start typing effect for the new message
      startTypingEffect(botMessage, data.answer, newMessageIndex);
    } catch (error) {
      setIsLoading(false); // Ensure loading stops on error
      console.error("Failed to fetch bot response:", error);
      const errorText = `Sorry, I encountered an error. ${
        error instanceof Error ? error.message : "Please try again."
      }`;
      const errorMessage: ChatMessage = {
        sender: "bot",
        text: "",
        isTyping: true,
      };
      const errorIndex = messages.length + (isLoading ? 0 : 1); // Adjust index based on current state
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      startTypingEffect(errorMessage, errorText, errorIndex);
    }
    // Removed finally block as isLoading is handled within try/catch
  }, [inputValue, messages, isLoading, setMessages, startTypingEffect]); // Added setMessages and startTypingEffect

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[60vh] flex flex-col shadow-2xl dark:shadow-blue-900/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ether Guru</CardTitle>
        <div className="flex items-center space-x-1"> {/* Wrapper for buttons */}
          {onExpand && (
            <Button variant="ghost" size="icon" onClick={onExpand} aria-label="Expand Chat">
              <Expand className="h-5 w-5" />
            </Button>
          )}
          {onMinimize && (
            <Button variant="ghost" size="icon" onClick={onMinimize} aria-label="Minimize Chat">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* Only render messages after client has mounted */}
            {hasMounted && messages.map((message, index) => (
              <motion.div
                key={index}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {message.sender === "bot" && (
                  <Avatar className="w-8 h-8 border shadow-sm">
                    <AvatarImage src="/ether-guru.png" alt="Bot" />
                    <AvatarFallback>EG</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] shadow-md overflow-wrap-anywhere break-words ${ // Added overflow-wrap-anywhere and break-words
                    message.sender === "user"
                      ? "bg-slate-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 prose prose-sm dark:prose-invert max-w-none"
                  }`}
                >
                  {message.sender === "bot" ? (
                    // Conditionally add cursor if typing
                    (<ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text + (message.isTyping ? "▍" : "")}
                    </ReactMarkdown>)
                  ) : (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 border shadow-sm">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
            {/* Dynamic Thinking Indicator */}
            {/* Also check hasMounted here if it depends on messages state indirectly */}
            {hasMounted && isLoading && (
              <motion.div
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar className="w-10 h-10 border shadow-lg">
                  <AvatarImage src="/ether-guru.png" alt="Bot" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 shadow-md">
                  {currentThinkingPhrase} {/* Display dynamic phrase */}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about Solidity events or topics..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading} // Keep disabled while loading OR typing
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              isLoading ||
              !inputValue.trim() ||
              messages.some((m) => m.isTyping)
            }
          >
            {isLoading
              ? "Wait..."
              : messages.some((m) => m.isTyping)
              ? "Typing..."
              : "Send"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
