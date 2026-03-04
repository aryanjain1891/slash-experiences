import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "@/db/queries/cart";
import { toSnakeCase } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await getCart(session.user.id);
    return NextResponse.json(items.map((item) => toSnakeCase(item)));
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
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
    const { experienceId, quantity, selectedDate, selectedTime } = body;

    const item = await addToCart(
      session.user.id,
      experienceId,
      quantity ?? 1,
      selectedDate ? new Date(selectedDate) : undefined,
      selectedTime
    );

    return NextResponse.json(toSnakeCase(item), { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const clear = searchParams.get("clear");

    if (clear === "true") {
      await clearCart(session.user.id);
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { id } = body;
    const item = await removeFromCart(id, session.user.id);

    return NextResponse.json(toSnakeCase(item));
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
