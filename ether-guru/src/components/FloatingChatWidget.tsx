'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatInterface } from '@/components/ChatInterface'; // Import the main chat logic
import { MessageSquare, X } from 'lucide-react'; // Icons for button

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* The Pop-up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 w-full max-w-md sm:max-w-lg">
          {/* Using Card styling for the pop-up */}
          <ChatInterface /> {/* Reuse the existing ChatInterface */}
        </div>
      )}

      {/* The Floating Toggle Button */}
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </>
  );
}
