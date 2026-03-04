import { NextRequest, NextResponse } from "next/server";
import {
  getAllExperiences,
  getExperiencesByCategory,
  getFeaturedExperiences,
  searchExperiences,
} from "@/db/queries/experiences";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    let data;

    if (search) {
      data = await searchExperiences(search);
    } else if (featured === "true") {
      data = await getFeaturedExperiences();
    } else if (category) {
      data = await getExperiencesByCategory(category);
    } else {
      data = await getAllExperiences();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
