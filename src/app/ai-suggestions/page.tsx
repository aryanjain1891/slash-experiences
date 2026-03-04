"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function AISuggestionsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">AI Suggestions</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
        Get personalized experience recommendations powered by AI based on your preferences
        and browsing history.
      </p>
      <div className="bg-secondary/20 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          Our AI suggestion engine is being trained to give you the best recommendations.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/experiences">Browse Experiences</Link>
      </Button>
    </div>
  );
}
