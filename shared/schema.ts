import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("client").notNull(), // 'admin' or 'client'
  company: varchar("company"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isSpam: boolean("is_spam").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  isSpam: true,
  isRead: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("unpaid").notNull(), // paid, unpaid, overdue
  dueDate: date("due_date").notNull(),
  items: jsonb("items").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Traffic analytics
export const trafficStats = pgTable("traffic_stats", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  pageViews: integer("page_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0"),
  avgSessionDuration: integer("avg_session_duration").default(0), // in seconds
  sources: jsonb("sources").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrafficStatSchema = createInsertSchema(trafficStats).omit({
  id: true,
  createdAt: true,
});

export type InsertTrafficStat = z.infer<typeof insertTrafficStatSchema>;
export type TrafficStat = typeof trafficStats.$inferSelect;

// Marketing plans - updated modern version
export const marketingPlans = pgTable("marketing_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(), 
  businessType: varchar("business_type").notNull(),
  goalsPrimary: varchar("goals_primary").notNull(),
  audience: varchar("audience").notNull(),
  budget: varchar("budget").notNull(),
  timeline: varchar("timeline").notNull(),
  competitors: varchar("competitors"),
  additionalInfo: varchar("additional_info"),
  includeSocialMedia: boolean("include_social_media").default(true),
  includeContentMarketing: boolean("include_content_marketing").default(true),
  includeSEO: boolean("include_seo").default(true),
  includeEmailMarketing: boolean("include_email_marketing").default(false),
  includePaidAdvertising: boolean("include_paid_advertising").default(false),
  strategies: jsonb("strategies").default([]),
  content: text("content"), // AI-generated marketing plan content in JSON format
  pdfUrl: varchar("pdf_url"), // URL to the uploaded PDF file
  pdfName: varchar("pdf_name"), // Original name of the PDF file
  status: varchar("status").default("draft"),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingPlanSchema = createInsertSchema(marketingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketingPlan = z.infer<typeof insertMarketingPlanSchema>;
export type MarketingPlan = typeof marketingPlans.$inferSelect;

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImageUrl: varchar("cover_image_url"),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Site settings for contact info and integrations
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  category: varchar("category").notNull().default("general"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Client documents for reports, contracts, files
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, docx, etc.
  category: varchar("category").notNull().default("report"), // report, contract, receipt, etc.
  userId: varchar("user_id").references(() => users.id).notNull(), // client id
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(), // admin id
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;