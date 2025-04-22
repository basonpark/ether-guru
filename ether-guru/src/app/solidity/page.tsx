'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function SolidityChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Center the chat interface vertically and horizontally */}
      <ChatInterface />
    </main>
  );
}
