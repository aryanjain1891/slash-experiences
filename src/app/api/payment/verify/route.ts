import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createPayment, updatePaymentStatus } from "@/db/queries/payments";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      bookingData,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (userId) {
      await createPayment({
        userId,
        bookingId: bookingData?.bookingId,
        razorpayOrderId: razorpay_order_id,
        amount: String(bookingData?.amount ?? 0),
        currency: bookingData?.currency,
      });
    }

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
