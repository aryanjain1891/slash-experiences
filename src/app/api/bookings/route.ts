import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBookingsByUser, createBooking } from "@/db/queries/bookings";
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
    const { totalAmount, paymentMethod, notes, items } = body;

    const booking = await createBooking({
      userId: session.user.id,
      totalAmount,
      paymentMethod,
      notes,
      items,
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
