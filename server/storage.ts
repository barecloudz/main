import { 
  users, 
  type User, 
  type UpsertUser,
  contacts,
  type Contact,
  type InsertContact,
  marketingPlans,
  type MarketingPlan,
  type InsertMarketingPlan,
  invoices,
  type Invoice,
  type InsertInvoice,
  trafficStats,
  type TrafficStat,
  type InsertTrafficStat,
  blogPosts,
  type BlogPost,
  type InsertBlogPost,
  siteSettings,
  type SiteSetting,
  type InsertSiteSetting,
  documents,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getUsers(): Promise<User[]>;
  getClientUsers(): Promise<User[]>;
  
  // Contact form operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(isSpam?: boolean): Promise<Contact[]>;
  markContactAsRead(id: number): Promise<void>;
  markContactAsSpam(id: number): Promise<void>;
  
  // Marketing plan operations
  createMarketingPlan(plan: InsertMarketingPlan): Promise<MarketingPlan>;
  getMarketingPlans(userId?: string): Promise<MarketingPlan[]>;
  getMarketingPlan(id: number): Promise<MarketingPlan | undefined>;
  updateMarketingPlan(id: number, plan: Partial<InsertMarketingPlan>): Promise<MarketingPlan | undefined>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoices(userId?: string): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  // Traffic stats operations
  createTrafficStat(stat: InsertTrafficStat): Promise<TrafficStat>;
  getTrafficStats(startDate?: Date, endDate?: Date): Promise<TrafficStat[]>;
  resetTrafficStats(): Promise<void>;
  
  // Blog operations
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Site settings operations
  getSetting(key: string): Promise<SiteSetting | undefined>;
  getSettingsByCategory(category: string): Promise<SiteSetting[]>;
  getAllSettings(): Promise<SiteSetting[]>;
  upsertSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSetting(id: number): Promise<void>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(userId?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  markDocumentAsRead(id: number): Promise<void>;
  deleteDocument(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: string): Promise<void> {
    // Delete related data first (to maintain referential integrity)
    // This assumes CASCADE deletion is not set up in the database
    
    // Delete user's marketing plans
    await db.delete(marketingPlans).where(eq(marketingPlans.userId, id));
    
    // Delete user's invoices
    await db.delete(invoices).where(eq(invoices.userId, id));
    
    // Delete user's documents
    await db.delete(documents).where(eq(documents.userId, id));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getClientUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "client"));
  }

  // Contact form operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts(isSpam?: boolean): Promise<Contact[]> {
    if (isSpam !== undefined) {
      return await db
        .select()
        .from(contacts)
        .where(eq(contacts.isSpam, isSpam))
        .orderBy(desc(contacts.createdAt));
    }
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async markContactAsRead(id: number): Promise<void> {
    await db
      .update(contacts)
      .set({ isRead: true })
      .where(eq(contacts.id, id));
  }

  async markContactAsSpam(id: number): Promise<void> {
    await db
      .update(contacts)
      .set({ isSpam: true })
      .where(eq(contacts.id, id));
  }
  
  async deleteContact(id: number): Promise<void> {
    await db
      .delete(contacts)
      .where(eq(contacts.id, id));
  }

  // Marketing plan operations
  async createMarketingPlan(plan: InsertMarketingPlan): Promise<MarketingPlan> {
    const [newPlan] = await db
      .insert(marketingPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async getMarketingPlans(userId?: string): Promise<MarketingPlan[]> {
    // Explicitly select all columns to avoid any column mapping issues
    const columns = {
      id: marketingPlans.id,
      userId: marketingPlans.userId,
      title: marketingPlans.title,
      businessType: marketingPlans.businessType,
      goalsPrimary: marketingPlans.goalsPrimary,
      audience: marketingPlans.audience,
      budget: marketingPlans.budget,
      timeline: marketingPlans.timeline,
      competitors: marketingPlans.competitors,
      additionalInfo: marketingPlans.additionalInfo,
      includeSocialMedia: marketingPlans.includeSocialMedia,
      includeContentMarketing: marketingPlans.includeContentMarketing,
      includeSEO: marketingPlans.includeSEO,
      includeEmailMarketing: marketingPlans.includeEmailMarketing,
      includePaidAdvertising: marketingPlans.includePaidAdvertising,
      strategies: marketingPlans.strategies,
      status: marketingPlans.status,
      isShared: marketingPlans.isShared,
      createdAt: marketingPlans.createdAt,
      updatedAt: marketingPlans.updatedAt
    };
    
    try {
      if (userId) {
        return await db
          .select(columns)
          .from(marketingPlans)
          .where(eq(marketingPlans.userId, userId))
          .orderBy(desc(marketingPlans.createdAt));
      }
      return await db
        .select(columns)
        .from(marketingPlans)
        .orderBy(desc(marketingPlans.createdAt));
    } catch (error) {
      console.error("Error in getMarketingPlans:", error);
      return [];
    }
  }

  async getMarketingPlan(id: number): Promise<MarketingPlan | undefined> {
    const [plan] = await db
      .select()
      .from(marketingPlans)
      .where(eq(marketingPlans.id, id));
    return plan;
  }

  async updateMarketingPlan(id: number, plan: Partial<InsertMarketingPlan>): Promise<MarketingPlan | undefined> {
    const [updatedPlan] = await db
      .update(marketingPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(marketingPlans.id, id))
      .returning();
    return updatedPlan;
  }
  
  async deleteMarketingPlan(id: number): Promise<void> {
    await db
      .delete(marketingPlans)
      .where(eq(marketingPlans.id, id));
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async getInvoices(userId?: string): Promise<Invoice[]> {
    if (userId) {
      return await db
        .select()
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .orderBy(desc(invoices.createdAt));
    }
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  // Traffic stats operations
  async createTrafficStat(stat: InsertTrafficStat): Promise<TrafficStat> {
    const [newStat] = await db
      .insert(trafficStats)
      .values(stat)
      .returning();
    return newStat;
  }

  async getTrafficStats(startDate?: Date, endDate?: Date): Promise<TrafficStat[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(trafficStats)
        .where(
          and(
            gte(trafficStats.date, startDate),
            lte(trafficStats.date, endDate)
          )
        )
        .orderBy(trafficStats.date);
    }
    return await db
      .select()
      .from(trafficStats)
      .orderBy(trafficStats.date);
  }
  
  async resetTrafficStats(): Promise<void> {
    // Delete all existing traffic stats
    await db.delete(trafficStats);
  }
  
  // Blog operations
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return blogPost;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [blogPost] = await db
      .update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return blogPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
  
  // Site settings operations
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }
  
  async getSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).where(eq(siteSettings.category, category));
  }
  
  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }
  
  async upsertSetting(settingData: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values(settingData)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          ...settingData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }
  
  async deleteSetting(id: number): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.id, id));
  }
  
  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }
  
  async getDocuments(userId?: string): Promise<Document[]> {
    if (userId) {
      return await db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt));
    }
    
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }
  
  async markDocumentAsRead(id: number): Promise<void> {
    await db
      .update(documents)
      .set({ isRead: true })
      .where(eq(documents.id, id));
  }
  
  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
