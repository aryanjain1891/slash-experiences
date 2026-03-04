"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";

export default function GiftPersonalizerPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">AI Gift Personalizer</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
        Our AI-powered gift personalizer will help you find the perfect experience gift
        based on the recipient&apos;s personality, interests, and occasion.
      </p>
      <div className="bg-secondary/20 rounded-2xl p-8 mb-8">
        <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          We&apos;re working hard to bring you an intelligent gift recommendation engine.
          Stay tuned!
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/experiences">Browse Experiences Instead</Link>
      </Button>
    </div>
  );
}
