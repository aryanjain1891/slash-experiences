"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/experience";

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
] as const;

type SortOrder = (typeof SORT_OPTIONS)[number]["value"];

const CATEGORIES = [
  "All",
  "Adventure",
  "Dining",
  "Wellness",
  "Luxury",
  "Learning",
  "Romance",
  "Sports",
  "Arts",
  "Nature",
];

const ITEMS_PER_PAGE = 9;

export default function ExperiencesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <ExperiencesContent />
    </Suspense>
  );
}

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const pageParam = searchParams.get("page");

  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam ?? "");
  const [activeCategory, setActiveCategory] = useState(categoryParam ?? "");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (activeCategory && activeCategory !== "All")
          params.set("category", activeCategory);

        const res = await fetch(`/api/experiences?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.experiences ?? [];
          setAllExperiences(list);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, [debouncedSearch, activeCategory]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory, sortOrder]);

  // Sort experiences client-side
  const sortedExperiences = useMemo(() => {
    const sorted = [...allExperiences];
    switch (sortOrder) {
      case "price-low":
        sorted.sort(
          (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
        );
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
        break;
    }
    return sorted;
  }, [allExperiences, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedExperiences.length / ITEMS_PER_PAGE);
  const paginatedExperiences = sortedExperiences.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (cat: string) => {
    const newCat = cat === "All" ? "" : cat;
    setActiveCategory(newCat);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveCategory("");
    setSortOrder("default");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || activeCategory || sortOrder !== "default";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            All Experiences
          </h1>
          <p className="text-muted-foreground">
            Discover unique experiences curated just for you
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={
                activeCategory === cat ||
                (cat === "All" && !activeCategory)
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handleCategoryClick(cat)}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${sortedExperiences.length} experience${sortedExperiences.length !== 1 ? "s" : ""} found`}
          </h2>

          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {SORT_OPTIONS.find((o) => o.value === sortOrder)?.label}
              </Button>
              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg py-1 min-w-[200px]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortOrder(opt.value);
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                          sortOrder === opt.value &&
                            "text-primary font-medium bg-primary/5"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : paginatedExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                id={exp.id}
                title={exp.title}
                description={exp.description ?? undefined}
                image_url={
                  typeof exp.image_url === "string"
                    ? exp.image_url
                    : undefined
                }
                price={parseFloat(exp.price) || 0}
                location={exp.location}
                duration={exp.duration}
                category={exp.category}
                isWishlisted={isWishlisted(exp.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl mb-2">No experiences found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters.
            </p>
            <Button onClick={clearAllFilters}>Clear All Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => {
                  const showEllipsis =
                    idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )}
                      <Button
                        variant={
                          currentPage === page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9 h-9"
                      >
                        {page}
                      </Button>
                    </span>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
