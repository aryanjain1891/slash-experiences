import { NextRequest, NextResponse } from "next/server";
import {
  getFAQs,
  getTestimonials,
  getPressReleases,
  getCompanyPage,
  getSupportPage,
} from "@/db/queries/content";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    switch (type) {
      case "faqs": {
        const data = await getFAQs();
        return NextResponse.json(data);
      }
      case "testimonials": {
        const data = await getTestimonials();
        return NextResponse.json(data);
      }
      case "press": {
        const data = await getPressReleases();
        return NextResponse.json(data);
      }
      default: {
        if (type.startsWith("company/")) {
          const pageName = type.replace("company/", "");
          const page = await getCompanyPage(pageName);
          if (!page) {
            return NextResponse.json(
              { error: "Page not found" },
              { status: 404 }
            );
          }
          return NextResponse.json(page);
        }

        if (type.startsWith("support/")) {
          const pageName = type.replace("support/", "");
          const page = await getSupportPage(pageName);
          if (!page) {
            return NextResponse.json(
              { error: "Page not found" },
              { status: 404 }
            );
          }
          return NextResponse.json(page);
        }

        return NextResponse.json(
          { error: "Unknown content type" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
