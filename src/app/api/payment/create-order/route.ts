import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCart } from "@/db/queries/cart";

const ALLOWED_CURRENCIES = new Set(["INR"]);

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 503 }
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const resolvedCurrency =
      typeof body?.currency === "string" && ALLOWED_CURRENCIES.has(body.currency)
        ? body.currency
        : "INR";

    // Compute amount server-side from the user's actual cart — never trust client amount
    const cartItems = await getCart(session.user.id);
    if (!cartItems.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price as string) * item.quantity,
      0
    );
    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: resolvedCurrency,
      receipt: `receipt_${crypto.randomUUID()}`,
    });

    return NextResponse.json({ ...order, serverAmount: totalAmount });
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number; error?: unknown };
    console.error("Error creating Razorpay order:", err.message, err.statusCode, err.error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
