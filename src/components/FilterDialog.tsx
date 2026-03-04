"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  experienceTypes: {
    romantic: boolean;
    adventurous: boolean;
    group: boolean;
    trending: boolean;
    featured: boolean;
  };
  locations: string[];
  location: string;
}

const defaultFilters: FilterOptions = {
  priceRange: [0, 100000],
  categories: [],
  experienceTypes: {
    romantic: false,
    adventurous: false,
    group: false,
    trending: false,
    featured: false,
  },
  locations: [],
  location: "",
};

const DEFAULT_LOCATIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions | null) => void;
  initialFilters?: FilterOptions | null;
}

export function getActiveFilterCount(filters: FilterOptions | null): number {
  if (!filters) return 0;
  let count = 0;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (Object.values(filters.experienceTypes).some(Boolean))
    count += Object.values(filters.experienceTypes).filter(Boolean).length;
  if (filters.locations.length > 0) count += filters.locations.length;
  if (filters.location) count += 1;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count += 1;
  return count;
}

export function FilterDialog({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || defaultFilters
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/experiences");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.experiences ?? [];
          const uniqueCategories = Array.from(
            new Set(
              list
                .map((e: { category?: string }) => e.category?.trim())
                .filter(Boolean)
                .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
            )
          ).sort() as string[];
          setCategories(uniqueCategories);
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen]);

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => {
      const exists = prev.categories.some(
        (c) => c.toLowerCase() === category.toLowerCase()
      );
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(
              (c) => c.toLowerCase() !== category.toLowerCase()
            )
          : [...prev.categories, category],
      };
    });
  };

  const handleExperienceTypeChange = (
    type: keyof FilterOptions["experienceTypes"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      experienceTypes: {
        ...prev.experienceTypes,
        [type]: !prev.experienceTypes[type],
      },
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFilters((prev) => {
      const exists = prev.locations.some(
        (l) => l.toLowerCase() === location.toLowerCase()
      );
      return {
        ...prev,
        locations: exists
          ? prev.locations.filter(
              (l) => l.toLowerCase() !== location.toLowerCase()
            )
          : [...prev.locations, location],
      };
    });
  };

  const handleReset = () => setFilters(defaultFilters);

  const handleApply = () => {
    const hasActive =
      filters.categories.length > 0 ||
      Object.values(filters.experienceTypes).some(Boolean) ||
      filters.locations.length > 0 ||
      filters.location.trim() !== "" ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 100000;

    onApply(hasActive ? filters : null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Experiences</SheetTitle>
          <SheetDescription>
            Customize your experience search by applying filters
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4 px-1">
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Price Range</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Min (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          Number(e.target.value) || 0,
                          prev.priceRange[1],
                        ],
                      }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Max (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          prev.priceRange[0],
                          Number(e.target.value) || 100000,
                        ],
                      }))
                    }
                  />
                </div>
              </div>
              <Slider
                value={filters.priceRange}
                min={0}
                max={100000}
                step={500}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: [v[0], v[1]],
                  }))
                }
                minStepsBetweenThumbs={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{filters.priceRange[0].toLocaleString()}</span>
                <span>₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={filters.categories.some(
                          (c) => c.toLowerCase() === category.toLowerCase()
                        )}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label
                        htmlFor={`cat-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No categories available
                  </p>
                )}
              </div>
            </div>

            {/* Experience Types */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Experience Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["romantic", "Romantic"],
                    ["adventurous", "Adventurous"],
                    ["group", "Group"],
                    ["trending", "Trending"],
                    ["featured", "Featured"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${key}`}
                      checked={filters.experienceTypes[key]}
                      onCheckedChange={() => handleExperienceTypeChange(key)}
                    />
                    <Label
                      htmlFor={`type-${key}`}
                      className="text-sm cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location text input */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">City / Location</Label>
              <Input
                placeholder="Type a city name..."
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            {/* Location multi-select */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Quick Location Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_LOCATIONS.map((loc) => (
                  <div key={loc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`loc-${loc}`}
                      checked={filters.locations.some(
                        (l) => l.toLowerCase() === loc.toLowerCase()
                      )}
                      onCheckedChange={() => handleLocationToggle(loc)}
                    />
                    <Label
                      htmlFor={`loc-${loc}`}
                      className="text-sm cursor-pointer"
                    >
                      {loc}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.locations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {filters.locations.map((loc) => (
                    <Badge
                      key={loc}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 cursor-pointer"
                      onClick={() => handleLocationToggle(loc)}
                    >
                      {loc}
                      <span className="text-xs hover:text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <SheetFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
