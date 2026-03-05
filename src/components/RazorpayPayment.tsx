"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (response: RazorpayResponse) => void;
  onFailure: (error: unknown) => void;
  userName?: string;
  userEmail?: string;
  description?: string;
  disabled?: boolean;
}

export default function RazorpayPayment({
  amount,
  onSuccess,
  onFailure,
  userName = "",
  userEmail = "",
  description = "Experience Booking Payment",
  disabled = false,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const onFailureRef = useRef(onFailure);
  onFailureRef.current = onFailure;

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onFailureRef.current(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!scriptLoaded) {
      onFailure(new Error("Razorpay SDK not loaded"));
      return;
    }

    setIsLoading(true);
    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order");
      }

      const order = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
        amount: Number(order.amount),
        currency: order.currency || "INR",
        name: "Slash Experiences",
        description,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: { amount, currency: "INR" },
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            onSuccess(response);
          } catch (error) {
            onFailure(error);
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options as RazorpayOptions);
      razorpay.open();
    } catch (error) {
      onFailure(error);
    } finally {
      setIsLoading(false);
    }
  }, [amount, description, onFailure, onSuccess, scriptLoaded, userEmail, userName]);

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !scriptLoaded}
      className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount.toLocaleString("en-IN")}`
      )}
    </Button>
  );
}
