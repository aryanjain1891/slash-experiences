import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getWishlist,
  toggleWishlist,
  getWishlistCount,
} from "@/db/queries/wishlist";
import { toSnakeCase } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [items, count] = await Promise.all([
      getWishlist(session.user.id),
      getWishlistCount(session.user.id),
    ]);

    return NextResponse.json({
      items: items.map((item) => toSnakeCase(item)),
      count,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
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
    const { experienceId } = body;

    const result = await toggleWishlist(session.user.id, experienceId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return NextResponse.json(
      { error: "Failed to toggle wishlist" },
      { status: 500 }
    );
  }
}
