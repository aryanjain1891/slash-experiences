"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <ExperiencesContent />
    </Suspense>
  );
}

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam ?? "");
  const [activeCategory, setActiveCategory] = useState(categoryParam ?? "");
  const { toggleWishlist, isWishlisted } = useWishlist();

  const categories = ["All", "Adventure", "Dining", "Wellness", "Luxury", "Learning", "Romance"];

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (activeCategory && activeCategory !== "All") params.set("category", activeCategory);

        const res = await fetch(`/api/experiences?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setExperiences(data.experiences ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, [searchQuery, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">All Experiences</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search experiences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat || (cat === "All" && !activeCategory) ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat === "All" ? "" : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Results */}
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
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No experiences found.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
