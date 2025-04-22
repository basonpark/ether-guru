'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define the structure for a chat message
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        const scrollableViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
      }, 0);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    const userQuery = inputValue.trim();
    if (!userQuery || isLoading) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = { sender: 'user', text: userQuery };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await fetch('/api/query-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = { sender: 'bot', text: data.answer }; // Assuming the API returns { answer: '...' }
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Failed to fetch bot response:', error);
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: `Sorry, I encountered an error. ${error instanceof Error ? error.message : 'Please try again.'}`,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow sending message with Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default form submission or newline
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle>Solidity Docs Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" /> {/* Placeholder for bot avatar */}
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[75%] whitespace-pre-wrap ${message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    {/* Add user avatar if desired, or use fallback */}
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback>AI</AvatarFallback>
                 </Avatar>
                 <div className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800">
                    Thinking...
                 </div>
              </div>
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
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
