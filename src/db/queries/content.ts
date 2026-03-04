import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import {
  faqs,
  testimonials,
  pressReleases,
  companyPages,
  supportPages,
} from "@/db/schema";

export async function getFAQs() {
  return db.select().from(faqs).orderBy(faqs.displayOrder);
}

export async function getTestimonials() {
  return db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.isFeatured), desc(testimonials.createdAt));
}

export async function getPressReleases() {
  return db
    .select()
    .from(pressReleases)
    .orderBy(desc(pressReleases.publishedDate));
}

export async function getCompanyPage(pageName: string) {
  const [page] = await db
    .select()
    .from(companyPages)
    .where(eq(companyPages.pageName, pageName));
  return page ?? null;
}

export async function getSupportPage(pageName: string) {
  const [page] = await db
    .select()
    .from(supportPages)
    .where(eq(supportPages.pageName, pageName));
  return page ?? null;
}
