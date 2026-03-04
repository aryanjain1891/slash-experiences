"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import ImageTrail from "@/components/ImageTrail";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSavedExperiences } from "@/hooks/useSavedExperiences";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/experience";
import {
  FilterDialog,
  getActiveFilterCount,
  type FilterOptions,
} from "@/components/FilterDialog";

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
] as const;

type SortOrder = (typeof SORT_OPTIONS)[number]["value"];

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "adventure", label: "Adventure" },
  { value: "dining", label: "Dining" },
  { value: "wellness", label: "Wellness" },
  { value: "luxury", label: "Luxury" },
  { value: "learning", label: "Learning" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "music", label: "Music" },
  { value: "technology", label: "Technology" },
] as const;

const ITEMS_PER_PAGE = 9;

function parseExpType(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return raw.trim() ? [raw.trim()] : [];
  }
}

function getFirstImageUrl(exp: Experience): string {
  const raw = exp.image_url;
  if (!raw) return "/assets/placeholder.jpg";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const arr = JSON.parse(trimmed);
        return Array.isArray(arr) && arr[0] ? String(arr[0]) : "/assets/placeholder.jpg";
      } catch {
        return trimmed;
      }
    }
    if (trimmed.includes(",")) return trimmed.split(",")[0].trim();
    return trimmed;
  }
  return "/assets/placeholder.jpg";
}

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
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const pageParam = searchParams.get("page");

  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam ?? "");
  const [activeCategory, setActiveCategory] = useState(
    categoryParam?.toLowerCase() ?? ""
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions | null>(null);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isSaved, toggleSaved } = useSavedExperiences();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (activeCategory) params.set("category", activeCategory);
        if (advancedFilters) {
          if (advancedFilters.priceRange[0] > 0)
            params.set("minPrice", String(advancedFilters.priceRange[0]));
          if (advancedFilters.priceRange[1] < 100000)
            params.set("maxPrice", String(advancedFilters.priceRange[1]));
          if (advancedFilters.location)
            params.set("location", advancedFilters.location);
        }

        const res = await fetch(`/api/experiences?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          let list: Experience[] = Array.isArray(data) ? data : data.experiences ?? [];

          if (advancedFilters) {
            if (advancedFilters.categories.length > 0) {
              const lowerCats = advancedFilters.categories.map((c) =>
                c.toLowerCase()
              );
              list = list.filter((e) =>
                lowerCats.includes(e.category?.toLowerCase())
              );
            }
            if (advancedFilters.locations.length > 0) {
              const lowerLocs = advancedFilters.locations.map((l) =>
                l.toLowerCase()
              );
              list = list.filter((e) =>
                lowerLocs.some((l) =>
                  e.location?.toLowerCase().includes(l)
                )
              );
            }
            const et = advancedFilters.experienceTypes;
            if (et.romantic) list = list.filter((e) => e.romantic);
            if (et.adventurous) list = list.filter((e) => e.adventurous);
            if (et.group) list = list.filter((e) => e.group_activity);
            if (et.trending) list = list.filter((e) => e.trending);
            if (et.featured) list = list.filter((e) => e.featured);
          }

          setAllExperiences(list);
        }
      } catch (err) {
        console.error("Failed to fetch experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, [debouncedSearch, activeCategory, advancedFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory, sortOrder]);

  const sortedExperiences = useMemo(() => {
    const sorted = [...allExperiences];
    switch (sortOrder) {
      case "price-low":
        sorted.sort(
          (a, b) => (parseFloat(String(a.price)) || 0) - (parseFloat(String(b.price)) || 0)
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) => (parseFloat(String(b.price)) || 0) - (parseFloat(String(a.price)) || 0)
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

  // Whether we're in "browse" mode (no search, no category filter, no advanced filters)
  const isBrowseMode = !debouncedSearch && !activeCategory && !advancedFilters;

  // Group by exp_type when in browse mode and sorted by default
  const groupedByType = useMemo(() => {
    if (!isBrowseMode || sortOrder !== "default") return null;
    const groups: Record<string, Experience[]> = {};
    const ungrouped: Experience[] = [];
    for (const exp of sortedExperiences) {
      const types = parseExpType(exp.exp_type);
      if (types.length > 0 && types[0]) {
        const key = types[0];
        if (!groups[key]) groups[key] = [];
        groups[key].push(exp);
      } else {
        ungrouped.push(exp);
      }
    }
    return { groups, ungrouped };
  }, [sortedExperiences, isBrowseMode, sortOrder]);

  // Collect images for the ImageTrail
  const trailImages = useMemo(
    () => allExperiences.slice(0, 20).map(getFirstImageUrl).filter((u) => u !== "/assets/placeholder.jpg"),
    [allExperiences]
  );

  // Flat pagination (used when search/filter active or non-default sort)
  const totalPages = groupedByType ? 1 : Math.ceil(sortedExperiences.length / ITEMS_PER_PAGE);
  const paginatedExperiences = groupedByType
    ? sortedExperiences
    : sortedExperiences.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );

  const handleCategoryClick = (value: string) => {
    setActiveCategory(value);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveCategory("");
    setSortOrder("default");
    setCurrentPage(1);
    setAdvancedFilters(null);
  };

  const activeFilterCount = getActiveFilterCount(advancedFilters);
  const hasActiveFilters =
    debouncedSearch || activeCategory || sortOrder !== "default" || activeFilterCount > 0;

  const GROUP_COLORS = [
    "bg-blue-50", "bg-green-50", "bg-yellow-50", "bg-pink-50",
    "bg-purple-50", "bg-orange-50", "bg-teal-50", "bg-indigo-50",
  ];

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

        {/* Image Trail */}
        {!isLoading && trailImages.length > 0 && (
          <div className="mb-8">
            <ImageTrail images={trailImages} />
          </div>
        )}

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
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(cat.value)}
              className="rounded-full"
            >
              {cat.label}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>

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

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : sortedExperiences.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl mb-2">No experiences found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters.
            </p>
            <Button onClick={clearAllFilters}>Clear All Filters</Button>
          </div>
        ) : groupedByType ? (
          /* Grouped view */
          <div className="space-y-10">
            {Object.entries(groupedByType.groups).map(([type, exps], idx) => (
              <section key={type}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{type}</h3>
                  <span className="text-sm text-muted-foreground">
                    {exps.length} experience{exps.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className={cn("rounded-2xl p-4 -mx-4", GROUP_COLORS[idx % GROUP_COLORS.length])}>
                  <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
                    {exps.map((exp) => (
                      <div key={exp.id} className="w-72 flex-shrink-0 snap-start">
                        <ExperienceCard
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
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {/* Ungrouped experiences */}
            {groupedByType.ungrouped.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Other Experiences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedByType.ungrouped.map((exp) => (
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
              </section>
            )}
          </div>
        ) : (
          /* Flat grid view */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedExperiences.map((exp) => (
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
          </>
        )}

        <FilterDialog
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={setAdvancedFilters}
          initialFilters={advancedFilters}
        />
      </div>
    </div>
  );
}
