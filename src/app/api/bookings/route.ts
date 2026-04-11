import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBookingsByUser, createBooking } from "@/db/queries/bookings";
import { getExperienceById } from "@/db/queries/experiences";
import { toSnakeCase } from "@/lib/api-utils";

function mapBooking(booking: Record<string, unknown>) {
  const { items, ...rest } = booking;
  const mapped = toSnakeCase(rest);
  if (Array.isArray(items)) {
    mapped.items = items.map((item: Record<string, unknown>) =>
      toSnakeCase(item)
    );
  }
  return mapped;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await getBookingsByUser(session.user.id);
    return NextResponse.json(bookings.map(mapBooking));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentMethod, notes, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items are required" },
        { status: 400 }
      );
    }

    // Validate each item and compute totalAmount server-side from DB prices
    const resolvedItems: { experienceId: string; quantity: number; priceAtBooking: string }[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const { experienceId, quantity } = item;
      if (typeof experienceId !== "string" || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return NextResponse.json(
          { error: "Invalid item: experienceId must be a string and quantity must be 1-100" },
          { status: 400 }
        );
      }
      const experience = await getExperienceById(experienceId);
      if (!experience) {
        return NextResponse.json(
          { error: `Experience ${experienceId} not found` },
          { status: 404 }
        );
      }
      const price = parseFloat(experience.price as string);
      totalAmount += price * quantity;
      resolvedItems.push({ experienceId, quantity, priceAtBooking: String(price) });
    }

    const notes_safe = typeof notes === "string" ? notes.slice(0, 1000) : undefined;

    const booking = await createBooking({
      userId: session.user.id,
      totalAmount: String(totalAmount.toFixed(2)),
      paymentMethod,
      notes: notes_safe,
      items: resolvedItems,
    });

    return NextResponse.json(mapBooking(booking), { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
