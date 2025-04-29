"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface"; // Import the main chat logic
import { MessageSquare, X, Expand } from "lucide-react"; // Icons for button (Expand might be used in ChatInterface now)
import { motion, AnimatePresence } from "framer-motion"; // Import motion components
import { useRouter } from "next/navigation"; // Import the router

// Define animation variants for the chat window
const chatVariants = {
  hidden: {
    opacity: 0,
    y: 30, // Start slightly below final position for the slide-up effect
    scale: 0.95, // Start slightly smaller
    transition: { duration: 0.2, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0, // Move to final position
    scale: 1, // Scale to full size
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize the router

  const toggleOpen = () => setIsOpen(!isOpen);

  // Function to handle expanding the chat to the full page
  const handleExpand = () => {
    router.push("/solidity"); // Navigate to the main Solidity chat page
    setIsOpen(false); // Close the widget
  };

  return (
    // Main container is fixed to bottom-right
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Position absolute, right-0. Bottom calculated as button height (h-14 -> 3.5rem) + gap (1rem) = 4.5rem
            // Removed transform classes.
            className="absolute right-0 bottom-[4.5rem] z-50 w-[90vw] max-w-md origin-bottom-right"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Render the ChatInterface inside the widget */}
            {/* Pass handleExpand and toggleOpen (as onMinimize) */}
            <ChatInterface onExpand={handleExpand} onMinimize={toggleOpen} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Action Button (FAB) to toggle the chat */}
      <motion.div
        initial={{ scale: 0 }} // Start button scaled down
        animate={{ scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.5,
          type: "spring",
          stiffness: 150,
        }} // Pop-in effect
      >
        <Button
          onClick={toggleOpen}
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
          <span className="sr-only">{isOpen ? "Close Chat" : "Open Chat"}</span>
        </Button>
      </motion.div>
    </div>
  );
}
