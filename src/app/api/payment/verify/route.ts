import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createPayment, updatePaymentStatus, getPaymentByOrderId } from "@/db/queries/payments";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = await request.json();

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    // Timing-safe signature comparison to prevent side-channel attacks
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // HMAC-SHA256 hex is always 64 chars — length check prevents timing leak on mismatched lengths
    const sigBuf = Buffer.from(expectedSignature);
    const inBuf = Buffer.from(
      razorpay_signature.length === expectedSignature.length
        ? razorpay_signature
        : "0".repeat(expectedSignature.length)
    );
    const signatureValid =
      razorpay_signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(sigBuf, inBuf);

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Replay protection — reject if this order was already processed
    const existing = await getPaymentByOrderId(razorpay_order_id);
    if (existing) {
      return NextResponse.json({ verified: true }); // idempotent success
    }

    // Fetch actual paid amount from Razorpay — never trust client-supplied amount
    const razorpay = getRazorpay();
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const paidAmount = String(Number(order.amount) / 100);

    await createPayment({
      userId,
      bookingId: bookingData?.bookingId,
      razorpayOrderId: razorpay_order_id,
      amount: paidAmount,
      currency: (order.currency as string) ?? "INR",
    });

    await updatePaymentStatus(razorpay_order_id, razorpay_payment_id, "paid");

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
