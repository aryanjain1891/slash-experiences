"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Gift,
  CheckCircle,
  Clock,
  Heart,
  Image as ImageIcon,
  CornerRightDown,
} from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data/categories";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { Experience } from "@/types/experience";
import {
  CITY_COORDINATES,
  calculateHaversineDistance,
  formatDistance,
  getSelectedCity,
} from "@/lib/location";

/* ------------------------------------------------------------------ */
/*  Animated counter – counts up on mount                             */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    if (isNaN(numeric)) {
      setDisplay(value);
      return;
    }
    const duration = 1500;
    const steps = 40;
    const increment = numeric / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        clearInterval(timer);
        current = numeric;
      }
      const formatted =
        numeric % 1 === 0 ? Math.round(current).toString() : current.toFixed(1);
      setDisplay(formatted + suffix);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

/* ------------------------------------------------------------------ */
/*  Homepage                                                          */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>([]);
  const [trendingExperiences, setTrendingExperiences] = useState<Experience[]>([]);
  const [cityExperiences, setCityExperiences] = useState<(Experience & { _distance?: number })[]>([]);
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Intersection observers for scroll animations
  const [heroRef, heroInView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [guideRef, guideInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [trendingRef, trendingInView] = useInView<HTMLDivElement>({ threshold: 0.1 });

  // Hero background image rotation
  const heroImages = [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2670&auto=format&fit=crop&h=1200",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566849787933-0bab0fafa2a4?q=80&w=2071&auto=format&fit=crop",
  ];
  const [currentImage, setCurrentImage] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentImage((p) => (p + 1) % heroImages.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const xVal = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    const yVal = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    setMousePosition({ x: xVal * 15, y: yVal * 15 });
  }, []);

  // Data fetching
  useEffect(() => {
    (async () => {
      setIsFeaturedLoading(true);
      try {
        const res = await fetch("/api/experiences?featured=true");
        if (res.ok) {
          const data = await res.json();
          setFeaturedExperiences(Array.isArray(data) ? data : data.experiences ?? []);
        }
      } catch (err) {
        console.error("Failed to load featured experiences:", err);
      } finally {
        setIsFeaturedLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setIsTrendingLoading(true);
      try {
        const res = await fetch("/api/experiences");
        if (res.ok) {
          const data = await res.json();
          const all: Experience[] = Array.isArray(data) ? data : data.experiences ?? [];
          setTrendingExperiences(all.filter((e) => e.trending));
        }
      } catch (err) {
        console.error("Failed to load experiences:", err);
      } finally {
        setIsTrendingLoading(false);
      }
    })();
  }, []);

  // City-based suggestions
  useEffect(() => {
    const city = getSelectedCity();
    setSelectedCityState(city);
    if (!city) return;

    const coords = CITY_COORDINATES[city];
    if (!coords) return;

    setIsCityLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/experiences");
        if (res.ok) {
          const data = await res.json();
          const all: Experience[] = Array.isArray(data)
            ? data
            : data.experiences ?? [];

          const withDistance = all
            .filter((e) => e.latitude && e.longitude)
            .map((e) => ({
              ...e,
              _distance: calculateHaversineDistance(
                coords.lat,
                coords.lng,
                parseFloat(e.latitude!),
                parseFloat(e.longitude!)
              ),
            }))
            .sort((a, b) => a._distance - b._distance)
            .slice(0, 6);

          setCityExperiences(withDistance);
        }
      } catch {
        /* ignore */
      } finally {
        setIsCityLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <main>
        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Background images with crossfade */}
          <div className="absolute inset-0 z-0">
            {heroImages.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1500ms] bg-cover bg-center",
                  index === currentImage ? "opacity-100" : "opacity-0"
                )}
                style={{
                  backgroundImage: `url(${url})`,
                  transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px) scale(1.05)`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-24 right-10 flex space-x-2 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentImage ? "bg-white w-6" : "bg-white/40"
                )}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>

          {/* Hero content */}
          <div className="container max-w-6xl mx-auto px-6 md:px-10 relative z-10 text-white mt-20">
            <div className="max-w-3xl">
              <div
                className={cn(
                  "transition-all duration-1000 transform",
                  heroInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                )}
              >
                <div className="-ml-[2px]">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight max-w-2xl">
                    Gifting Something, <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                      That Matters
                    </span>
                  </h1>
                </div>

                <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl">
                  92% of all people prefer an Experience over a Material gift
                  and 63% forget what they received a year back.
                </p>

                <div className="flex flex-col items-center space-y-8 w-full">
                  <div className="flex flex-col md:flex-row gap-4 justify-start w-full mb-2">
                    <Link href="/experiences">
                      <Button
                        size="lg"
                        className="bg-secondary text-primary rounded-full font-semibold text-lg shadow-lg hover:bg-secondary/80 hover:text-primary hover:scale-[1.03] transition-transform duration-200 h-12 px-8 flex items-center gap-2 border-2 border-secondary"
                      >
                        Explore Experiences
                        <span className="ml-1">&rarr;</span>
                      </Button>
                    </Link>
                    <a href="#gifting-guide">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-primary text-primary bg-white rounded-full font-semibold text-lg hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.03] transition-transform duration-200 h-12 px-8 flex items-center gap-2 shadow-md"
                      >
                        Gift Inspiration
                      </Button>
                    </a>
                  </div>

                  {/* Stats bar */}
                  <div
                    className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mx-auto transition-all duration-1000 delay-300",
                      heroInView
                        ? "translate-y-0 opacity-100"
                        : "translate-y-20 opacity-0"
                    )}
                  >
                    {[
                      { value: "500+", label: "Experiences" },
                      { value: "50k+", label: "Happy Recipients" },
                      { value: "4.9", label: "Average Rating" },
                      { value: "100%", label: "Satisfaction" },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center min-w-[100px] border border-white/10"
                      >
                        <div className="text-xl md:text-2xl font-normal text-white/80 mb-1">
                          <AnimatedCounter value={stat.value} />
                        </div>
                        <p className="text-xs md:text-sm text-white/70 font-normal">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 right-10 flex flex-col items-center animate-bounce">
            <div className="w-0.5 h-8 bg-white/30 mb-2" />
            <span className="text-white/70 text-sm">Scroll to explore</span>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FEATURED EXPERIENCES                                        */}
        {/* ============================================================ */}
        <section id="suggested" className="py-20 md:py-28">
          <div className="container max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium mb-4 animate-fade-in">
                Featured Experiences
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                Hand-picked experiences to create unforgettable memories
              </p>
            </div>

            {isFeaturedLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <span className="ml-4 text-lg">Loading experiences...</span>
              </div>
            ) : featuredExperiences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredExperiences.slice(0, 6).map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    id={exp.id}
                    title={exp.title}
                    description={exp.description}
                    image_url={exp.image_url}
                    price={exp.price}
                    location={exp.location}
                    duration={exp.duration}
                    participants={exp.participants}
                    category={exp.category}
                    niche_category={exp.niche_category}
                    trending={exp.trending}
                    featured={exp.featured}
                    romantic={exp.romantic}
                    adventurous={exp.adventurous}
                    group_activity={exp.group_activity}
                    isWishlisted={isWishlisted(exp.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No featured experiences available yet.
              </p>
            )}

            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link href="/experiences">View All Experiences</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SUGGESTED FOR YOUR CITY                                     */}
        {/* ============================================================ */}
        {selectedCity && (
          <section className="py-16 bg-secondary/5">
            <div className="container max-w-6xl mx-auto px-6 md:px-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-medium mb-4">
                  Suggested for you in {selectedCity}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experiences near your selected city, sorted by distance
                </p>
              </div>

              {isCityLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : cityExperiences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityExperiences.map((exp) => (
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
                      isWishlisted={isWishlisted(exp.id)}
                      onToggleWishlist={toggleWishlist}
                      distanceKm={exp._distance}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No nearby experiences found for {selectedCity}.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  WHY GIFT AN EXPERIENCE                                      */}
        {/* ============================================================ */}
        <div className="w-full">
          <hr className="border-t border-gray-200" />
          <span id="gifting-guide" className="block" />
          <section
            ref={guideRef}
            className="container max-w-[1152px] mx-auto px-4 py-20"
          >
            <div
              className={cn(
                "space-y-16 transition-all duration-700",
                guideInView ? "opacity-100" : "opacity-0 translate-y-8"
              )}
            >
              <div className="text-center">
                <h2 className="text-3xl font-medium mb-6">
                  Why Gift an Experience?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Research shows that experiences create stronger emotional
                  connections and more lasting happiness than material
                  possessions. Let&apos;s explore why.
                </p>
              </div>

              {/* Comparison cards */}
              <div className="grid gap-8 md:grid-cols-2 md:gap-12">
                {/* Material Gifts */}
                <div className="bg-secondary/30 p-8 rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-medium mb-4">Material Gifts</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        Quick enjoyment but excitement fades over time
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ImageIcon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        Takes up physical space and can contribute to clutter
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CornerRightDown className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        Value and appreciation often decreases with time
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Heart className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        Can be meaningful but often lacks personal touch
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Experience Gifts */}
                <div className="bg-primary/10 p-8 rounded-2xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium mb-4">
                    Experience Gifts
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span>
                        Creates lasting memories and stories to share
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span>
                        No physical clutter - only emotional richness
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span>
                        Appreciation increases over time as memories are
                        cherished
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span>
                        Deepens relationships through shared moments
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Stats section */}
              <div className="bg-secondary/20 rounded-2xl p-8 md:p-10">
                <h3 className="text-2xl font-medium mb-6 text-center">
                  The Science Behind Experience Gifts
                </h3>
                <div className="grid sm:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      78%
                    </div>
                    <p className="text-muted-foreground">
                      of people prefer experiences over material items
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      3x
                    </div>
                    <p className="text-muted-foreground">
                      longer lasting happiness from experiential purchases
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      85%
                    </div>
                    <p className="text-muted-foreground">
                      stronger memory retention for experiences vs. objects
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <span className="text-9xl">&ldquo;</span>
                </div>
                <blockquote className="text-xl md:text-2xl text-center italic relative z-10 max-w-3xl mx-auto">
                  &ldquo;We don&apos;t remember days, we remember moments. The
                  richness of life lies in memories we have forgotten.&rdquo;
                  <div className="text-base text-muted-foreground mt-4 not-italic">
                    — Cesare Pavese
                  </div>
                </blockquote>
              </div>
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/*  BROWSE BY CATEGORY                                          */}
        {/* ============================================================ */}
        <section className="py-16 bg-secondary/10">
          <div className="container max-w-6xl mx-auto px-6 md:px-10">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-10">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/experiences?category=${cat.name.toLowerCase()}`}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background hover:shadow-md transition-shadow border"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  TRENDING NOW                                                */}
        {/* ============================================================ */}
        <section className="py-20" ref={trendingRef}>
          <div className="container max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div
                className={cn(
                  "max-w-xl mb-6 md:mb-0 transition-all duration-700",
                  trendingInView
                    ? "opacity-100"
                    : "opacity-0 translate-y-8"
                )}
              >
                <h2 className="text-3xl md:text-4xl font-medium mb-4">
                  Trending Now
                </h2>
                <p className="text-muted-foreground">
                  The most popular experience gifts that everyone&apos;s talking
                  about
                </p>
              </div>

              <Link
                href="/experiences"
                className={cn(
                  "group inline-flex items-center transition-all duration-700 delay-100",
                  trendingInView
                    ? "opacity-100"
                    : "opacity-0 translate-y-8"
                )}
              >
                <Button variant="ghost" className="gap-2">
                  View All Experiences
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {isTrendingLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : trendingExperiences.length > 0 ? (
              <div
                className={cn(
                  "relative overflow-visible",
                  trendingInView ? "opacity-100" : "opacity-0"
                )}
              >
                <Carousel
                  opts={{
                    align: "center",
                    slidesToScroll: 1,
                  }}
                >
                  <CarouselContent className="-ml-2">
                    {trendingExperiences.map((exp) => (
                      <CarouselItem
                        key={exp.id}
                        className="basis-full sm:basis-1/2 md:basis-1/3 pl-2"
                      >
                        <ExperienceCard
                          id={exp.id}
                          title={exp.title}
                          description={exp.description}
                          image_url={exp.image_url}
                          price={exp.price}
                          location={exp.location}
                          duration={exp.duration}
                          participants={exp.participants}
                          category={exp.category}
                          niche_category={exp.niche_category}
                          trending={exp.trending}
                          featured={exp.featured}
                          romantic={exp.romantic}
                          adventurous={exp.adventurous}
                          group_activity={exp.group_activity}
                          isWishlisted={isWishlisted(exp.id)}
                          onToggleWishlist={toggleWishlist}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="bg-black hover:bg-black/90 text-white -left-8 lg:-left-12" />
                  <CarouselNext className="bg-black hover:bg-black/90 text-white -right-8 lg:-right-12" />
                </Carousel>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No trending experiences available at the moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
