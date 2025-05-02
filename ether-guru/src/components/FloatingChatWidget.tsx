"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface"; 
import { MessageSquare, X, Expand } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { useRouter } from "next/navigation"; 

// Define animation variants for the chat window
const chatVariants = {
  hidden: {
    opacity: 0,
    y: 30, 
    scale: 0.95, 
    transition: { duration: 0.2, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0, 
    scale: 1, 
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); 
  const router = useRouter(); 

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowWelcomePopup(false); 
  };

  // Function to handle expanding the chat to the full page
  const handleExpand = () => {
    router.push("/solidity"); 
    setIsOpen(false); 
  };

  // Effect to show the welcome popup
  useEffect(() => {
    // Only show popup if chat isn't already open (e.g., from navigation)
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1500); 

      const hideTimer = setTimeout(() => {
        setShowWelcomePopup(false);
      }, 8000); 

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      }; 
    }
  }, [isOpen]); 

  return (
    // Main container is fixed to bottom-right, using flex to stack popup and button
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && !isOpen && (
          <motion.div
            className="mb-2 p-3 rounded-lg bg-background border shadow-lg cursor-pointer max-w-xs text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={toggleOpen} 
          >
            👋 Hi! Ask me anything about Solidity.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Position absolute, right-0. Bottom calculated as button height (h-14 -> 3.5rem) + gap (1rem) = 4.5rem
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

      {/* Floating Action Button (FAB) */}
      <motion.div
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.5,
          type: "spring",
          stiffness: 150,
        }} 
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
