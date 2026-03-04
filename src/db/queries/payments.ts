import { db } from "@/db";
import { eq } from "drizzle-orm";
import { payments } from "@/db/schema";

export async function createPayment(data: {
  userId: string;
  bookingId?: string;
  razorpayOrderId: string;
  amount: string;
  currency?: string;
}) {
  const [payment] = await db
    .insert(payments)
    .values({
      userId: data.userId,
      bookingId: data.bookingId,
      razorpayOrderId: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency ?? "INR",
    })
    .returning();
  return payment;
}

export async function updatePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  status: string
) {
  const [payment] = await db
    .update(payments)
    .set({ razorpayPaymentId, status })
    .where(eq(payments.razorpayOrderId, razorpayOrderId))
    .returning();
  return payment;
}
