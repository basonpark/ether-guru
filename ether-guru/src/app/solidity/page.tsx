"use client";

import { ChatInterface } from "@/components/ChatInterface";
import Image from "next/image";

export default function SolidityChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-16 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-gray-50 to-gray-400 dark:from-gray-200 dark:to-gray-800 h-full">
      {/* Add description and image above the chat */}
      <div className="text-center mb-8 max-w-2xl">
        {/* Add Ether Guru Avatar */}
        <Image
          src="/ether-guru.png"
          alt="Ether Guru Avatar"
          width={120}
          height={120}
          className="rounded-full mx-auto mb-4 shadow-white shadow-xl  border-white dark:border-gray-700"
        />
        <h1 className="text-3xl font-bold mb-2">Solidity AI Assistant</h1>
        <p className="text-md text-muted-foreground">
          Ask me anything about Solidity! I've been trained on the official
          v0.8.29 documentation. I can help explain concepts, find specific
          details, or discuss events, functions, and contracts.
        </p>
      </div>

      {/* Center the chat interface vertically and horizontally */}
      <ChatInterface />
    </main>
  );
}
