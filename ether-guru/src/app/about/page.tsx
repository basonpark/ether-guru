// src/app/about/page.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-slate-600 to-slate-800 text-transparent bg-clip-text">
        About EtherGuru
      </h1>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 text-center max-w-2xl mx-auto">
        EtherGuru is your interactive platform for mastering smart contract security through hands-on challenges inspired by real-world vulnerabilities.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Learn by Doing</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Tackle Ethernaut-style challenges.</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700 dark:text-slate-300">
            Gain practical experience by exploiting and fixing Solidity vulnerabilities in a safe environment.
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Focus on Security</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Understand common pitfalls.</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700 dark:text-slate-300">
            Deepen your understanding of reentrancy, access control issues, integer overflows, and more.
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Community Driven</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Future features planned.</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700 dark:text-slate-300">
            We aim to build a community around learning and securing the Ethereum ecosystem. (More features coming soon!)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
