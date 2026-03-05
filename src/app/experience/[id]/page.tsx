"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  ArrowLeft,
  Heart,
  Bookmark,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedExperiences } from "@/hooks/useSavedExperiences";
import { useTrackExperienceView } from "@/hooks/useTrackExperienceView";
import ExperienceCard from "@/components/ExperienceCard";
import type { Experience } from "@/types/experience";

import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

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
  return src;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-xl">
          <p className="text-muted-foreground">Map could not be loaded.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { isSaved, toggleSaved } = useSavedExperiences();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarExperiences, setSimilarExperiences] = useState<Experience[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useTrackExperienceView(user?.id, id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only scroll

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/experiences/${id}`);
        if (!res.ok) {
          router.replace("/experiences");
          return;
        }
        const { experience } = await res.json();
        setExperience(experience);
      } catch {
        router.replace("/experiences");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  useEffect(() => {
    if (!experience) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/experiences?category=${encodeURIComponent(experience.category)}`
        );
        if (res.ok) {
          const data = await res.json();
          const list: Experience[] = Array.isArray(data)
            ? data
            : data.experiences ?? [];
          setSimilarExperiences(
            list.filter((e: Experience) => e.id !== experience.id).slice(0, 4)
          );
        }
      } catch {
        /* ignore */
      }
    })();
  }, [experience]);

  useEffect(() => {
    setMapReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount-only: enable map after hydration

  const imageUrls = useMemo(() => {
    if (!experience) return [];
    const raw = experience.image_url;
    if (Array.isArray(raw)) return raw.filter(Boolean).map((u) => getValidImgSrc(u));
    if (typeof raw === "string" && raw) {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map((u: unknown) => getValidImgSrc(u));
        } catch { /* fall through */ }
      }
      if (trimmed.includes(",") && !trimmed.startsWith("data:")) {
        return trimmed.split(",").map((u) => getValidImgSrc(u.trim()));
      }
      return [getValidImgSrc(trimmed)];
    }
    return ["/assets/placeholder.jpg"];
  }, [experience]);

  const handlePrevImage = () =>
    setCurrentImageIdx((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  const handleNextImage = () =>
    setCurrentImageIdx((i) => (i + 1) % imageUrls.length);

  const handleAddToCart = async () => {
    if (!experience) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date before adding to cart.");
      return;
    }
    setIsCartLoading(true);
    try {
      await addToCart({
        experienceId: experience.id,
        quantity,
        selectedDate: selectedDate?.toISOString(),
      });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart.");
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!experience) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to manage your wishlist.");
      return;
    }
    try {
      const result = await toggleWishlist(experience.id);
      toast.success(result.added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist.");
    }
  };

  const lat = experience?.latitude ? parseFloat(experience.latitude) : null;
  const lng = experience?.longitude ? parseFloat(experience.longitude) : null;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
  const priceNum = experience ? parseFloat(String(experience.price)) || 0 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!experience) return null;

  const inWishlist = isWishlisted(experience.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Image / Carousel */}
      <div className="relative w-full h-56 md:h-[50vh] lg:h-[60vh]">
        <img
          src={getValidImgSrc(imageUrls[currentImageIdx])}
          alt={experience.title}
          className="h-full w-full object-cover"
        />

        {imageUrls.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-20"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-20"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="absolute top-6 left-6 z-30">
          <button
            onClick={() => router.back()}
            className="bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>

        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {imageUrls.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  currentImageIdx === idx
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-medium mb-4 break-words">
            {experience.title}
          </h1>

          {/* Category badge */}
          {experience.category && (
            <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
              {experience.category}
            </span>
          )}

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={handleToggleWishlist}
              className={cn(
                "flex items-center gap-2 font-medium border",
                inWishlist
                  ? "text-white bg-red-500 border-red-500 hover:bg-red-600"
                  : "text-gray-700 bg-gray-100 border-gray-300 hover:text-red-500 hover:border-red-400"
              )}
            >
              <Heart
                className={cn("h-5 w-5", inWishlist && "fill-current")}
                fill={inWishlist ? "currentColor" : "none"}
              />
              {inWishlist ? "Liked" : "Like"}
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleSaved(experience.id)}
              className={cn(
                "flex items-center gap-2 font-medium border",
                isSaved(experience.id)
                  ? "text-primary border-primary"
                  : "text-gray-700 border-gray-300"
              )}
            >
              <Bookmark
                className={cn("h-5 w-5", isSaved(experience.id) && "fill-current")}
                fill={isSaved(experience.id) ? "currentColor" : "none"}
              />
              {isSaved(experience.id) ? "Saved" : "Save for Later"}
            </Button>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{experience.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{experience.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{experience.participants}</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-full mb-8 text-center">
            <p>{experience.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 w-full">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-2 rounded-lg mb-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Duration</h3>
              <p className="text-muted-foreground text-xs">
                {experience.duration}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-2 rounded-lg mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Group Size</h3>
              <p className="text-muted-foreground text-xs">
                {experience.participants}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-2 rounded-lg mb-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Date</h3>
              <p className="text-muted-foreground text-xs">
                {experience.date}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-2 rounded-lg mb-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Location</h3>
              <p className="text-muted-foreground text-xs">
                {experience.location}
              </p>
            </div>
          </div>

          {/* Booking section */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Book This Experience</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Date picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </Button>
              </div>

              {/* Price + Add to cart */}
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-2xl font-bold text-primary">
                  ₹{(priceNum * quantity).toLocaleString("en-IN")}
                </span>
                <Button
                  onClick={handleAddToCart}
                  disabled={isCartLoading}
                  className="flex items-center gap-2"
                >
                  {isCartLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          {hasCoords && mapReady && !mapError && (
            <div className="w-full rounded-xl overflow-hidden mb-8 shadow-md">
              <h2 className="text-xl font-medium mb-4">Location</h2>
              <div className="h-[300px] w-full">
                <MapErrorBoundary onError={() => setMapError(true)}>
                  <MapContainer
                    center={[lat!, lng!]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat!, lng!]} />
                  </MapContainer>
                </MapErrorBoundary>
              </div>
            </div>
          )}

          {/* Similar Experiences */}
          {similarExperiences.length > 0 && (
            <div className="w-full mt-12">
              <h2 className="text-2xl font-medium mb-6">
                Similar Experiences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {similarExperiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    id={exp.id}
                    title={exp.title}
                    image_url={exp.image_url}
                    price={exp.price}
                    location={exp.location}
                    duration={exp.duration}
                    category={exp.category}
                    isWishlisted={isWishlisted(exp.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
