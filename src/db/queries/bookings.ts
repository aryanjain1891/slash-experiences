import { db, getDb } from "@/db";
import { eq, desc } from "drizzle-orm";
import { bookings, bookingItems, experiences } from "@/db/schema";

export async function getBookingsByUser(userId: string) {
  const userBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.bookingDate));

  const result = await Promise.all(
    userBookings.map(async (booking) => {
      const items = await db
        .select({
          id: bookingItems.id,
          bookingId: bookingItems.bookingId,
          experienceId: bookingItems.experienceId,
          quantity: bookingItems.quantity,
          priceAtBooking: bookingItems.priceAtBooking,
          title: experiences.title,
          imageUrl: experiences.imageUrl,
          location: experiences.location,
        })
        .from(bookingItems)
        .innerJoin(experiences, eq(bookingItems.experienceId, experiences.id))
        .where(eq(bookingItems.bookingId, booking.id));
      return { ...booking, items };
    })
  );

  return result;
}

export async function createBooking(data: {
  userId: string;
  totalAmount: string;
  paymentMethod: string;
  status?: string;
  notes?: string;
  items: {
    experienceId: string;
    quantity: number;
    priceAtBooking: string;
  }[];
}) {
  // Use a transaction so booking + items are atomic — no orphaned bookings on partial failure
  return getDb().transaction(async (tx) => {
    const [booking] = await tx
      .insert(bookings)
      .values({
        userId: data.userId,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        status: data.status ?? "confirmed",
        notes: data.notes,
      })
      .returning();

    const items = await tx
      .insert(bookingItems)
      .values(
        data.items.map((item) => ({
          bookingId: booking.id,
          experienceId: item.experienceId,
          quantity: item.quantity,
          priceAtBooking: item.priceAtBooking,
        }))
      )
      .returning();

    return { ...booking, items };
  });
}
