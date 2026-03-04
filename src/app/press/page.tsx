"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface PressItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url?: string;
  excerpt?: string;
}

export default function PressPage() {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/content/press");
        if (res.ok) {
          const data = await res.json();
          setPressItems(data.items ?? []);
        }
      } catch (err) {
        console.error("Failed to load press:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Press & Media</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Slash Experiences in the news. Read about our journey and media coverage.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : pressItems.length > 0 ? (
            <div className="space-y-6">
              {pressItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.source} &middot; {item.date}
                        </p>
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  {item.excerpt && (
                    <CardContent>
                      <p className="text-muted-foreground">{item.excerpt}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No press coverage available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
