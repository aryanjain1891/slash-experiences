"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

export default function SwipePage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <ArrowLeftRight className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">Swipe Experiences</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
        Discover experiences by swiping left or right — like a dating app, but for
        experiences! Find what resonates with you.
      </p>
      <div className="bg-secondary/20 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          The swipe feature is under development. We&apos;re crafting a fun and
          interactive way to explore experiences.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/experiences">Browse Experiences</Link>
      </Button>
    </div>
  );
}
