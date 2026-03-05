"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  text: string;
  experience?: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/content/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(Array.isArray(data) ? data : data.items ?? []);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Real stories from people who gifted and received experiences through Slash.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        {t.experience && <p className="text-sm text-muted-foreground">{t.experience}</p>}
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{t.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No testimonials available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
