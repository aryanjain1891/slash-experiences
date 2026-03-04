"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExperienceCard from "@/components/ExperienceCard";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Experience } from "@/types/experience";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const categorySlug = id ? decodeURIComponent(id).toLowerCase() : "";

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/experiences?category=${encodeURIComponent(categorySlug)}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.experiences ?? [];
          setExperiences(list);
        }
      } catch (err) {
        console.error("Failed to load category experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (categorySlug) load();
  }, [categorySlug]);

  return (
    <div className="container max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{categorySlug}</h1>
      <p className="text-muted-foreground mb-8">Browse {categorySlug} experiences</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : experiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              id={exp.id}
              title={exp.title}
              description={exp.description}
              image_url={exp.image_url}
              price={exp.price}
              location={exp.location}
              duration={exp.duration}
              category={exp.category}
              niche_category={exp.niche_category}
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
