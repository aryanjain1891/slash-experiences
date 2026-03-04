"use client";

import Link from "next/link";
import { Heart, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExperienceCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  location?: string;
  duration?: string;
  category?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function ExperienceCard({
  id,
  title,
  imageUrl,
  price,
  location,
  duration,
  category,
  isWishlisted,
  onToggleWishlist,
}: ExperienceCardProps) {
  return (
    <Card className="group overflow-hidden border hover:shadow-lg transition-shadow">
      <Link href={`/experience/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl || "/assets/placeholder.jpg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {category && (
            <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded">
              {category}
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/experience/${id}`} className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          {onToggleWishlist && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(id);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isWishlisted && "fill-red-500 text-red-500"
                )}
              />
            </Button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {duration}
            </span>
          )}
        </div>
        <div className="mt-2 font-semibold text-sm">
          ₹{price.toLocaleString("en-IN")}
        </div>
      </CardContent>
    </Card>
  );
}
