"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, HeartIcon, MapPin, Clock, Navigation, Bookmark } from "lucide-react";
import { formatDistance } from "@/lib/location";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useSavedExperiences } from "@/hooks/useSavedExperiences";

const FALLBACK_IMAGES = [
  "/assets/placeholder.jpg",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
];

function getValidImgSrc(src: unknown): string {
  if (!src) return "/assets/placeholder.jpg";
  if (Array.isArray(src)) return getValidImgSrc(src[0]);
  if (typeof src === "object" && src !== null) {
    const obj = src as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.path === "string") return obj.path;
    return "/assets/placeholder.jpg";
  }
  if (typeof src !== "string") return "/assets/placeholder.jpg";
  if (src.startsWith("data:image/")) return src;
  return src.replace("/lovable-uploads/", "/assets/");
}

function parseImageUrls(imageUrl: unknown): string[] {
  if (imageUrl == null) return [];
  if (Array.isArray(imageUrl)) return imageUrl.map((u: unknown) => getValidImgSrc(u));
  if (typeof imageUrl !== "string") return [];
  const trimmed = imageUrl.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("data:image/")) return [trimmed];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((u: unknown) => getValidImgSrc(u));
    } catch {
      // fall through to comma-split
    }
  }
  if (trimmed.includes(",") && !trimmed.startsWith("data:")) {
    return trimmed.split(",").map((u) => getValidImgSrc(u.trim()));
  }
  return [getValidImgSrc(trimmed)];
}

export interface ExperienceCardProps {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  price: string | number;
  location?: string;
  duration?: string;
  participants?: string;
  category?: string;
  niche_category?: string | null;
  trending?: boolean | null;
  featured?: boolean | null;
  romantic?: boolean | null;
  adventurous?: boolean | null;
  group_activity?: boolean | null;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  distanceKm?: number;
}

export default function ExperienceCard({
  id,
  title,
  image_url,
  price,
  location,
  duration,
  category,
  isWishlisted = false,
  onToggleWishlist,
  distanceKm,
}: ExperienceCardProps) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedExperiences();
  const images = parseImageUrls(image_url ?? null);
  const [imgSrc, setImgSrc] = useState(images[0] || "/assets/placeholder.jpg");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const first = images[0] || "/assets/placeholder.jpg";
    setImgSrc(first);
    setImgError(false);
  }, [image_url]);

  const formattedPrice =
    typeof price === "number"
      ? price.toLocaleString("en-IN")
      : Number(price).toLocaleString("en-IN");

  const handleCardClick = (e: React.MouseEvent) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (["button", "a", "svg", "path"].includes(tag)) return;
    router.push(`/experience/${id}`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleWishlist?.(id);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow hover:shadow-xl transition-shadow duration-200 group relative mb-10 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(`/experience/${id}`);
      }}
      role="button"
      aria-label={`View details for ${title}`}
    >
      {/* Image section */}
      <div className="aspect-[3/2] w-full overflow-hidden rounded-t-2xl relative">
        {images.length > 1 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx} className="w-full h-full">
                  <img
                    src={img}
                    alt={title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105",
                      imgError && "border-4 border-red-500"
                    )}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/assets/placeholder.jpg";
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80" />
          </Carousel>
        ) : (
          <img
            src={imgSrc}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105",
              imgError && "border-4 border-red-500"
            )}
            onError={(e) => {
              e.currentTarget.onerror = null;
              setImgSrc("/assets/placeholder.jpg");
              setImgError(true);
            }}
            onLoad={() => setImgError(false)}
          />
        )}

        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full z-10 capitalize">
            {category}
          </span>
        )}

        {/* Wishlist heart, visible on hover */}
        {onToggleWishlist && (
          <button
            className="absolute top-4 right-4 z-20 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
          >
            {isWishlisted ? (
              <HeartIcon className="h-5 w-5 text-red-500 fill-red-500 transition" />
            ) : (
              <Heart className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition" />
            )}
          </button>
        )}

        {/* Save for later bookmark */}
        <button
          className="absolute top-4 right-14 z-20 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title={isSaved(id) ? "Remove from saved" : "Save for later"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleSaved(id);
          }}
        >
          <Bookmark
            className={cn(
              "h-5 w-5 transition",
              isSaved(id) ? "text-primary fill-primary" : "text-gray-300 group-hover:text-primary"
            )}
          />
        </button>
      </div>

      {/* Info section */}
      <div className="p-4 w-full max-w-full">
        {/* Title and price row */}
        <div className="flex justify-between items-center mb-1">
          <h3
            className="font-semibold text-lg truncate flex items-center"
            title={title}
          >
            {title}
          </h3>
          <span className="font-bold text-primary text-base ml-2 whitespace-nowrap">
            ₹{formattedPrice}
          </span>
        </div>

        {/* Location row */}
        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-1 truncate">
            <MapPin className="inline-block h-4 w-4 mr-1 text-gray-400 shrink-0" />
            <span className="truncate" title={location}>
              {location}
            </span>
          </div>
        )}

        {/* Duration row */}
        {duration && (
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Clock className="inline-block h-4 w-4 mr-1 text-gray-400 shrink-0" />
            <span>{duration}</span>
          </div>
        )}

        {/* Distance row */}
        {distanceKm != null && (
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Navigation className="inline-block h-4 w-4 mr-1 text-gray-400 shrink-0" />
            <span>{formatDistance(distanceKm)} away</span>
          </div>
        )}

        {/* View Experience button */}
        <Link href={`/experience/${id}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="w-full mt-3 font-medium">
            View Experience
          </Button>
        </Link>
      </div>
    </div>
  );
}
