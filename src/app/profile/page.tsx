"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Heart,
  Calendar,
  LogOut,
  Edit,
  Share2,
  Eye,
  Loader2,
} from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import type { Experience } from "@/types/experience";

interface ProfileData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface Booking {
  id: string;
  total_amount: string;
  status: string;
  booking_date: string;
  items?: {
    experience_id: string;
    quantity: number;
    price_at_booking: string;
  }[];
}

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({});
  const [isSaving, setIsSaving] = useState(false);

  const [wishlistItems, setWishlistItems] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewedItems, setViewedItems] = useState<Experience[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);

  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingViewed, setLoadingViewed] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch profile
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch wishlist
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingWishlist(true);
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        const items = data.items ?? [];
        setWishlistItems(items);
        setWishlistCount(data.count ?? items.length);
      })
      .catch(() => {})
      .finally(() => setLoadingWishlist(false));
  }, [isAuthenticated]);

  // Fetch bookings
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingBookings(true);
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [isAuthenticated]);

  // Fetch viewed history
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingViewed(true);
    fetch("/api/views/history")
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setViewedItems(items);
        setViewedCount(items.length);
      })
      .catch(() => {})
      .finally(() => setLoadingViewed(false));
  }, [isAuthenticated]);

  const handleEditOpen = () => {
    setEditForm({
      full_name: profile?.full_name || user?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      bio: profile?.bio || "",
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
          bio: editForm.bio,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        toast.success("Profile updated!");
        setEditOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const displayName = profile?.full_name || user.name || "User";
  const stats = [
    { label: "Viewed", value: viewedCount },
    { label: "Liked", value: wishlistCount },
    { label: "Bookings", value: bookings.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-muted to-muted/50 border-b">
        <div className="container max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url || user.image || undefined} />
              <AvatarFallback className="text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={handleEditOpen}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareProfile}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="wishlist">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" /> Wishlist
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="viewed" className="gap-2">
              <Eye className="h-4 w-4" /> Viewed
            </TabsTrigger>
          </TabsList>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-6">
            {loadingWishlist ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    id={exp.id}
                    title={exp.title}
                    image_url={exp.image_url}
                    price={exp.price}
                    location={exp.location}
                    duration={exp.duration}
                    category={exp.category}
                    isWishlisted={true}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No liked experiences yet. Start exploring!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            {loadingBookings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <p className="font-medium">
                            Booking #{booking.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.booking_date
                              ? new Date(booking.booking_date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            ₹
                            {Number(booking.total_amount || 0).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {booking.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No bookings yet. Start exploring experiences!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Viewed Tab */}
          <TabsContent value="viewed" className="mt-6">
            {loadingViewed ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : viewedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {viewedItems.map((exp) => (
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
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No viewed experiences yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.full_name || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Input
                id="edit-bio"
                value={editForm.bio || ""}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
