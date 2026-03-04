"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

export default function TravelDemoPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Plane className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">Travel Demo</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
        Explore curated travel experiences with our interactive demo.
        Plan the perfect getaway for your loved ones.
      </p>
      <div className="bg-secondary/20 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          We&apos;re building an immersive travel experience demo. Stay tuned!
        </p>
      </div>
      <Button size="lg" asChild>
        <Link href="/experiences">Browse Experiences</Link>
      </Button>
    </div>
  );
}
