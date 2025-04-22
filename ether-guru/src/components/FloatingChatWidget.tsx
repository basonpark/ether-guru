'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ChatInterface'; // Import the main chat logic
import { MessageSquare, X } from 'lucide-react'; // Icons for button
import { motion, AnimatePresence } from 'framer-motion'; // Import motion components

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Animation variants for the chat window
  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      y: 20,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      {/* AnimatePresence handles the exit animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-40 w-full max-w-md sm:max-w-lg origin-bottom-right" // Added origin for scale
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Using Card styling for the pop-up */}
            <ChatInterface /> {/* Reuse the existing ChatInterface */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Floating Toggle Button */}
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* Animate button icon change (optional but nice) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </motion.div>
        </AnimatePresence>
      </Button>
    </>
  );
}
