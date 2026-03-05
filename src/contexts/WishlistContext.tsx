"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlistCount: number;
  wishlistedIds: Set<string>;
  isLoading: boolean;
  toggleWishlist: (experienceId: string) => Promise<void>;
  refreshCount: () => Promise<void>;
  isWishlisted: (experienceId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistedIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const ids = (data.items ?? []).map((i: { experience_id?: string; experienceId?: string }) => i.experience_id || i.experienceId);
        setWishlistedIds(new Set(ids));
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const toggleWishlist = async (experienceId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId }),
      });
      if (res.ok) await refreshCount();
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  const isWishlisted = (experienceId: string) => wishlistedIds.has(experienceId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount: wishlistedIds.size,
        wishlistedIds,
        isLoading,
        toggleWishlist,
        refreshCount,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
