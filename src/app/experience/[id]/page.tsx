"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

interface Experience {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  location?: string;
  duration?: string;
  category?: string;
  participants?: string;
}

export default function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/experiences/${id}`);
        if (res.ok) {
          const data = await res.json();
          setExperience(data);
        }
      } catch (err) {
        console.error("Failed to load experience:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
        <Button asChild>
          <Link href="/experiences">Browse Experiences</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: experience.id,
      experienceId: experience.id,
      title: experience.title,
      price: experience.price,
      imageUrl: experience.imageUrl,
    });
  };

  return (
    <div className="container max-w-5xl mx-auto px-6 py-10">
      <Link href="/experiences" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Experiences
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden aspect-[4/3]">
          <img
            src={experience.imageUrl || "/assets/placeholder.jpg"}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          {experience.category && (
            <Badge variant="secondary" className="w-fit mb-3">{experience.category}</Badge>
          )}
          <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            {experience.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {experience.location}
              </span>
            )}
            {experience.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {experience.duration}
              </span>
            )}
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {experience.description || "No description available."}
          </p>

          <div className="text-3xl font-bold mb-6">
            ₹{experience.price.toLocaleString("en-IN")}
          </div>

          <div className="flex gap-3 mt-auto">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleWishlist(experience.id)}
            >
              <Heart className={cn("h-5 w-5", isWishlisted(experience.id) && "fill-red-500 text-red-500")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
