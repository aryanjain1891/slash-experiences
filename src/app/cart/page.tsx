"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import RazorpayPayment from "@/components/RazorpayPayment";

function getValidImgSrc(src: unknown): string {
  if (!src) return "/assets/placeholder.jpg";
  if (typeof src === "string") return src;
  return "/assets/placeholder.jpg";
}

export default function CartPage() {
  const { items, isLoading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const totalPrice = items.reduce(
    (sum, item) => sum + (parseFloat(String(item.price)) || 0) * (item.quantity || 1),
    0
  );

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart(id);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(id, newQuantity);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success("Payment successful! Booking confirmed.");
    await clearCart();
    router.push("/bookings");
  };

  const handlePaymentFailure = (error: unknown) => {
    console.error("Payment failed:", error);
    toast.error("Payment failed. Please try again.");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {items.length > 0 ? (
        <div className="space-y-8">
          <div className="space-y-4">
            {items.map((item) => {
              const itemPrice = (parseFloat(String(item.price)) || 0) * (item.quantity || 1);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border"
                >
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={getValidImgSrc(item.image_url)}
                      alt={item.title || "Experience"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/experience/${item.experience_id}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title || "Experience"}
                    </Link>
                    {item.selected_date && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date(item.selected_date).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </p>
                    )}
                    <p className="text-primary font-semibold mt-1">
                      ₹{itemPrice.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <RazorpayPayment
                amount={totalPrice}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                userName={user?.name ?? ""}
                userEmail={user?.email ?? ""}
                description="Slash Experiences Cart Checkout"
                disabled={totalPrice <= 0}
              />
              <Button
                variant="outline"
                onClick={() => clearCart()}
                className="w-full"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse our experiences and add something special!
          </p>
          <Button asChild>
            <Link href="/experiences">Browse Experiences</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
