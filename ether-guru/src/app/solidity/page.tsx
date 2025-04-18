import { MessageSquare } from "lucide-react";

export default function SolidityChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]"> {/* Adjust height based on header/footer */}
      <MessageSquare className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">Solidity AI Assistant</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center max-w-md">
        Coming Soon: Ask questions about Solidity documentation and get instant answers powered by AI.
      </p>
      {/* Placeholder for the actual chat interface */}
      <div className="w-full max-w-2xl h-96 bg-muted rounded-lg border border-border flex items-center justify-center">
        <p className="text-muted-foreground">Chat interface will be here.</p>
      </div>
    </div>
  );
}
