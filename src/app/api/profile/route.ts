import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProfile, updateProfile } from "@/db/queries/profiles";
import { toSnakeCase } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile(session.user.id);
    return NextResponse.json(profile ? toSnakeCase(profile) : null);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, avatarUrl, phone, address, bio } = body;

    const profile = await updateProfile(session.user.id, {
      fullName,
      avatarUrl,
      phone,
      address,
      bio,
    });

    return NextResponse.json(toSnakeCase(profile));
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
