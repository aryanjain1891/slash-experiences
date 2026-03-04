"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const categoryName = id ? decodeURIComponent(id) : "";

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/experiences?category=${encodeURIComponent(categoryName)}`);
        if (res.ok) {
          const data = await res.json();
          setExperiences(data.experiences ?? []);
        }
      } catch (err) {
        console.error("Failed to load category experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (categoryName) load();
  }, [categoryName]);

  return (
    <div className="container max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{categoryName}</h1>
      <p className="text-muted-foreground mb-8">Browse {categoryName} experiences</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : experiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              {...exp}
              isWishlisted={isWishlisted(exp.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No experiences found in this category.
        </p>
      )}
    </div>
  );
}
