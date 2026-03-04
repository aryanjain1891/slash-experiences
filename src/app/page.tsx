"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, CheckCircle, Clock, Heart } from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import { useWishlist } from "@/contexts/WishlistContext";

interface Experience {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  location?: string;
  duration?: string;
  category?: string;
}

const categories = [
  { name: "Adventure", emoji: "🏔️" },
  { name: "Dining", emoji: "🍽️" },
  { name: "Wellness", emoji: "🧘" },
  { name: "Luxury", emoji: "✨" },
  { name: "Learning", emoji: "📚" },
  { name: "Romance", emoji: "💕" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/experiences?featured=true&limit=6");
        if (res.ok) {
          const data = await res.json();
          setFeatured(data.experiences ?? []);
        }
      } catch (err) {
        console.error("Failed to load featured experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="container relative z-10 mx-auto px-6 py-20 text-center md:text-left max-w-5xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Gifting Something,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              That Matters
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
            92% of all people prefer an experience over a material gift. Create
            lasting memories with curated experience gifts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="rounded-full text-lg px-8">
              <Link href="/experiences">
                Explore Experiences <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full text-lg px-8 border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/gift-personalizer">Gift Personalizer</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl">
            {[
              { value: "500+", label: "Experiences" },
              { value: "50k+", label: "Happy Recipients" },
              { value: "4.9", label: "Average Rating" },
              { value: "100%", label: "Satisfaction" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-lg p-4 text-center border border-white/10"
              >
                <div className="text-xl md:text-2xl font-semibold">{stat.value}</div>
                <p className="text-xs text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Featured Experiences
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hand-picked experiences to create unforgettable memories
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  {...exp}
                  isWishlisted={isWishlisted(exp.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No featured experiences available yet.
            </p>
          )}
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/experiences">View All Experiences</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/20">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-medium text-center mb-10">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/experiences?category=${cat.name}`}
                className="flex flex-col items-center gap-2 p-6 rounded-xl bg-background hover:shadow-md transition-shadow border"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Gift an Experience */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-medium text-center mb-12">
            Why Gift an Experience?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-secondary/30 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-4">Material Gifts</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 mt-0.5 shrink-0" /> Quick enjoyment but excitement fades
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-5 w-5 mt-0.5 shrink-0" /> Can lack personal touch
                </li>
              </ul>
            </div>
            <div className="bg-primary/10 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium mb-4">Experience Gifts</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" /> Creates lasting memories
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" /> Deepens relationships
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" /> Appreciation grows over time
                </li>
              </ul>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 mt-12 bg-secondary/20 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">78%</div>
              <p className="text-muted-foreground text-sm">prefer experiences over material items</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">3x</div>
              <p className="text-muted-foreground text-sm">longer lasting happiness</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <p className="text-muted-foreground text-sm">stronger memory retention</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
