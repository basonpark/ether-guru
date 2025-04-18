import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import DesktopNavBarWrapper from "@/components/ui/DesktopNavBarWrapper"; 

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EtherGuru - Learn Smart Contract Security",
  description:
    "Interactive Ethernaut-style challenges to learn about Solidity vulnerabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        {/* Header section */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between"> 
            {/* Render NavBar Wrapper (will include EtherGuru link now) */}
            <div className="flex flex-1 items-center justify-center">
              <DesktopNavBarWrapper />
            </div>
          </div>
        </header>

        <div className="flex flex-1"> 
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
