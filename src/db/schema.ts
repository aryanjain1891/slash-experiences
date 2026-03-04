import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  date,
  json,
  pgEnum,
  index,
  vector,
} from "drizzle-orm/pg-core";

export const providerStatusEnum = pgEnum("provider_status", [
  "pending",
  "active",
  "inactive",
  "suspended",
]);

export const experienceStatusEnum = pgEnum("experience_status", [
  "pending",
  "active",
  "inactive",
]);

// ── Core ──

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    contactNo: varchar("contact_no", { length: 50 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    status: providerStatusEnum("status").default("pending"),
    joinDate: timestamp("join_date", { withTimezone: true }).defaultNow(),
    experiences: integer("experiences").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_providers_status").on(table.status),
    index("idx_providers_email").on(table.email),
  ]
);

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    duration: varchar("duration", { length: 100 }).notNull(),
    participants: varchar("participants", { length: 100 }).notNull(),
    date: varchar("date", { length: 100 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    nicheCategory: varchar("niche_category", { length: 100 }),
    trending: boolean("trending").default(false),
    featured: boolean("featured").default(false),
    romantic: boolean("romantic").default(false),
    adventurous: boolean("adventurous").default(false),
    groupActivity: boolean("group_activity").default(false),
    tags: text("tags"),
    expType: text("exp_type"),
    status: varchar("status", { length: 50 }).default("active"),
    idtag: integer("idtag"),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_experiences_category").on(table.category),
  ]
);

// ── User ──

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  bio: text("bio"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  referredUserId: uuid("referred_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const connections = pgTable("connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  connectedUserId: uuid("connected_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const viewedExperiences = pgTable("viewed_experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow(),
});

// ── Commerce ──

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  selectedDate: timestamp("selected_date", { withTimezone: true }),
  selectedTime: text("selected_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  bookingDate: timestamp("booking_date", { withTimezone: true }).defaultNow(),
});

export const bookingItems = pgTable("booking_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  priceAtBooking: decimal("price_at_booking", { precision: 10, scale: 2 }),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── AI ──

export const giftPersonalizations = pgTable("gift_personalizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  cardStyle: varchar("card_style", { length: 100 }),
  deliveryMethod: varchar("delivery_method", { length: 100 }),
  message: text("message"),
  category: varchar("category", { length: 100 }),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const giftQuestionnaireResponses = pgTable(
  "gift_questionnaire_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipient: varchar("recipient", { length: 255 }),
    relationship: varchar("relationship", { length: 100 }),
    occasion: varchar("occasion", { length: 100 }),
    budget: varchar("budget", { length: 100 }),
    interests: text("interests").array(),
    adventurous: boolean("adventurous"),
    learning: boolean("learning"),
    relaxation: boolean("relaxation"),
    social: boolean("social"),
    amazon: varchar("amazon", { length: 255 }),
    instagram: varchar("instagram", { length: 255 }),
    facebook: varchar("facebook", { length: 255 }),
    userId: uuid("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

export const aiSessions = pgTable("ai_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  currentStep: integer("current_step").default(0),
  answers: json("answers").$type<Record<string, string>>().default({}),
  context: json("context").$type<Record<string, unknown>>().default({}),
  suggestions: json("suggestions").$type<unknown[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Content ──

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  quote: text("quote").notNull(),
  avatarUrl: text("avatar_url"),
  company: varchar("company", { length: 255 }),
  role: varchar("role", { length: 255 }),
  rating: integer("rating").default(5),
  experienceId: uuid("experience_id").references(() => experiences.id),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pressReleases = pgTable("press_releases", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  publication: varchar("publication", { length: 255 }),
  publishedDate: date("published_date"),
  externalLink: text("external_link"),
  publicationLogoUrl: text("publication_logo_url"),
  fullContent: text("full_content"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const companyPages = pgTable("company_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageName: varchar("page_name", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: json("content"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const supportPages = pgTable("support_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageName: varchar("page_name", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: json("content"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const careerListings = pgTable("career_listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  requirements: text("requirements"),
  salaryRange: varchar("salary_range", { length: 100 }),
  isActive: boolean("is_active").default(true),
  isRemote: boolean("is_remote").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
