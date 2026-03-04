import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { experiences } from "@/db/schema";
import { eq, desc, asc, and, ilike, gte, lte, sql, type SQL } from "drizzle-orm";
import { mapExperiences } from "@/lib/api-utils";
import { searchExperiences } from "@/db/queries/experiences";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const location = searchParams.get("location");
    const expType = searchParams.get("expType");
    const sort = searchParams.get("sort");

    if (search) {
      const data = await searchExperiences(search);
      return NextResponse.json({ experiences: mapExperiences(data) });
    }

    const conditions: SQL[] = [];

    if (featured === "true") {
      conditions.push(eq(experiences.featured, true));
    }

    if (category) {
      conditions.push(ilike(experiences.category, category));
    }

    if (minPrice) {
      conditions.push(gte(experiences.price, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(experiences.price, maxPrice));
    }

    if (location) {
      conditions.push(ilike(experiences.location, `%${location}%`));
    }

    if (expType) {
      conditions.push(ilike(experiences.expType, `%${expType}%`));
    }

    let orderBy;
    switch (sort) {
      case "price_asc":
        orderBy = asc(experiences.price);
        break;
      case "price_desc":
        orderBy = desc(experiences.price);
        break;
      case "newest":
      default:
        orderBy = desc(experiences.createdAt);
        break;
    }

    let query = db.select().from(experiences).$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.orderBy(orderBy);

    return NextResponse.json({ experiences: mapExperiences(data) });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
