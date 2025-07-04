import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { authenticateUser, isAuthenticated, isAdmin, hashPassword, comparePassword } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertContactSchema, insertMarketingPlanSchema, insertInvoiceSchema, insertTrafficStatSchema, insertDocumentSchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import path from "path";
import { upload, getFileUrl, deleteFile } from "./upload";
import { 
  initializeEmailTransport, 
  sendWelcomeEmail, 
  sendPasswordResetEmail,
  verifyPasswordToken,
  invalidateToken
} from "./email";

// Admin middleware is now imported from auth.ts

// Configure rate limiter
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many contact requests from this IP, please try again later."
});

// Email functionality disabled to prevent errors
// If email features are needed, SMTP credentials should be provided
// const emailTransporter = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: process.env.SMTP_USER || "your_mailtrap_user",
//     pass: process.env.SMTP_PASS || "your_mailtrap_password"
//   }
// });

// Spam detection for contact form
function isLikelySpam(message: string): boolean {
  const spamKeywords = [
    "viagra", "casino", "lottery", "prize", "winner", 
    "loan", "credit", "free money", "discount", "cheap",
    "buy now", "limited time", "sell", "invest", "investment",
    "bitcoin", "crypto", "cryptocurrency", "pharmacy"
  ];
  
  message = message.toLowerCase();
  
  // Check for spam keywords
  for (const keyword of spamKeywords) {
    if (message.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // Check for excessive capitalization
  const capitalLetterCount = (message.match(/[A-Z]/g) || []).length;
  const totalLength = message.length;
  if (totalLength > 20 && capitalLetterCount / totalLength > 0.3) {
    return true;
  }
  
  // Check for excessive links
  const linkCount = (message.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    return true;
  }
  
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup OpenID auth
  await setupAuth(app);
  
  // Custom login route with password
  app.post('/api/auth/login', authenticateUser);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // User update (profile update)
  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, company, phone, profileImageUrl } = req.body;
      
      // Ensure user can only update their own profile unless they're an admin
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== 'admin' && id !== currentUserId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(id, { 
        firstName, 
        lastName, 
        email, 
        company, 
        phone,
        profileImageUrl,
        updatedAt: new Date() 
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Admin routes for user management
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get('/api/admin/clients', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const clients = await storage.getClientUsers();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching client users:", error);
      res.status(500).json({ message: "Failed to fetch client users" });
    }
  });
  
  app.post('/api/admin/users/update-role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role || !['admin', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid user ID or role" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Protect the primary admin account (admin@barecloudz.com) from being downgraded
      if (user.email === "admin@barecloudz.com" && role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin account cannot be downgraded" });
      }
      
      const updatedUser = await storage.upsertUser({
        ...user,
        role
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Client account creation (admin only)
  app.post('/api/admin/create-client', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, company, phone } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate a unique ID for the client
      const clientId = `client_${Date.now()}`;
      
      const newClient = await storage.upsertUser({
        id: clientId,
        email,
        firstName,
        lastName,
        company,
        phone,
        role: 'client'
      });
      
      res.status(201).json(newClient);
    } catch (error) {
      console.error("Error creating client account:", error);
      res.status(500).json({ message: "Failed to create client account" });
    }
  });

  // Contact form submission
  app.post('/api/contacts', contactFormLimiter, async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      
      // Check for spam
      const isSpam = isLikelySpam(contactData.message);
      const contact = await storage.createContact({
        ...contactData,
      });
      
      // Mark as spam if detected
      if (isSpam) {
        await storage.markContactAsSpam(contact.id);
      }
      
      res.status(201).json({
        message: "Thank you for your message. We will contact you soon.",
        id: contact.id
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Admin routes
  // Get all users (admin only)
  app.get('/api/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get client users (admin only)
  app.get('/api/users/clients', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clients = await storage.getClientUsers();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching client users:", error);
      res.status(500).json({ message: "Failed to fetch client users" });
    }
  });
  
  // Delete user account
  app.delete('/api/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only allow users to delete their own account or admins to delete any account
      if (currentUserId !== userId && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to delete this account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.upsertUser({
        ...user,
        role
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Get contact form submissions (admin only)
  app.get('/api/contacts', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { spam } = req.query;
      const isSpam = spam === 'true' ? true : spam === 'false' ? false : undefined;
      
      const contacts = await storage.getContacts(isSpam);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Mark contact as read (admin only)
  app.patch('/api/contacts/:id/read', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markContactAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking contact as read:", error);
      res.status(500).json({ message: "Failed to mark contact as read" });
    }
  });

  // Mark contact as spam (admin only)
  app.patch('/api/contacts/:id/spam', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markContactAsSpam(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking contact as spam:", error);
      res.status(500).json({ message: "Failed to mark contact as spam" });
    }
  });
  
  // Delete contact form submission (admin only)
  app.delete('/api/contacts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContact(parseInt(id));
      res.status(200).json({ success: true, message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Marketing plans
  // Create marketing plan (admin only)
  app.post('/api/marketing-plans', isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log("Received marketing plan data:", JSON.stringify(req.body));
      
      // Import the OpenAI generator
      const { generateMarketingPlan } = await import('./openai');
      
      // Extract the required fields from the request body
      const { 
        userId, 
        title, 
        businessType, 
        goalsPrimary, 
        audience, 
        budget, 
        timeline,
        competitors,
        additionalInfo,
        includeSocialMedia,
        includeContentMarketing,
        includeSEO,
        includeEmailMarketing,
        includePaidAdvertising,
        status
      } = req.body;
      
      // Validate required fields
      if (!userId || !businessType || !goalsPrimary || !audience || !budget || !timeline) {
        return res.status(400).json({ 
          message: "Validation error: Required fields missing - userId, businessType, goalsPrimary, audience, budget, and timeline are required" 
        });
      }
      
      // Get client information for personalized plan
      const client = await storage.getUser(userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Format client name for AI generation
      const clientName = client.firstName && client.lastName
        ? `${client.firstName} ${client.lastName}`
        : client.firstName || client.lastName || client.company || "the client";
      
      // Generate AI marketing plan
      const aiMarketingPlan = await generateMarketingPlan({
        businessType,
        goalsPrimary,
        audience,
        budget,
        timeline,
        competitors,
        additionalInfo,
        includeSocialMedia: includeSocialMedia === undefined ? true : includeSocialMedia,
        includeContentMarketing: includeContentMarketing === undefined ? true : includeContentMarketing,
        includeSEO: includeSEO === undefined ? true : includeSEO,
        includeEmailMarketing: includeEmailMarketing === undefined ? false : includeEmailMarketing,
        includePaidAdvertising: includePaidAdvertising === undefined ? false : includePaidAdvertising
      }, clientName);
      
      // Create the actual title
      const planTitle = title || `Marketing Plan for ${clientName} - ${businessType}`;
      
      // Create the marketing plan with the provided data and AI-generated content
      const plan = await storage.createMarketingPlan({
        userId,
        title: planTitle,
        businessType,
        goalsPrimary,
        audience,
        budget,
        timeline,
        competitors: competitors || "",
        additionalInfo: additionalInfo || "",
        includeSocialMedia: includeSocialMedia === undefined ? true : includeSocialMedia,
        includeContentMarketing: includeContentMarketing === undefined ? true : includeContentMarketing,
        includeSEO: includeSEO === undefined ? true : includeSEO,
        includeEmailMarketing: includeEmailMarketing === undefined ? false : includeEmailMarketing,
        includePaidAdvertising: includePaidAdvertising === undefined ? false : includePaidAdvertising,
        strategies: aiMarketingPlan.strategies || [],
        content: JSON.stringify(aiMarketingPlan),
        status: status || 'draft'
      });
      
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating AI marketing plan:", error);
      res.status(500).json({ message: `Failed to create marketing plan: ${error.message || "Unknown error"}` });
    }
  });

  // Get all marketing plans (admin only)
  app.get('/api/marketing-plans', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const plans = await storage.getMarketingPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching marketing plans:", error);
      res.status(500).json({ message: "Failed to fetch marketing plans" });
    }
  });

  // Get marketing plans for a user
  app.get('/api/users/:userId/marketing-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if admin or the user is accessing their own plans
      if (currentUser?.role !== 'admin' && currentUserId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plans = await storage.getMarketingPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching user's marketing plans:", error);
      res.status(500).json({ message: "Failed to fetch marketing plans" });
    }
  });

  // Get a specific marketing plan
  app.get('/api/marketing-plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getMarketingPlan(parseInt(id));
      
      if (!plan) {
        return res.status(404).json({ message: "Marketing plan not found" });
      }
      
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if admin or the plan belongs to the user
      if (currentUser?.role !== 'admin' && plan.userId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching marketing plan:", error);
      res.status(500).json({ message: "Failed to fetch marketing plan" });
    }
  });
  
  // Update marketing plan status
  app.patch('/api/marketing-plans/:id/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ message: "Plan ID and status are required" });
      }
      
      const plan = await storage.updateMarketingPlan(parseInt(id), { status });
      
      if (!plan) {
        return res.status(404).json({ message: "Marketing plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error updating marketing plan status:", error);
      res.status(500).json({ message: "Failed to update marketing plan status" });
    }
  });
  
  // Share marketing plan with client
  app.post('/api/marketing-plans/:id/share', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const plan = await storage.getMarketingPlan(parseInt(id));
      
      if (!plan) {
        return res.status(404).json({ message: "Marketing plan not found" });
      }
      
      const client = await storage.getUser(plan.userId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Update plan status to active if it's in draft
      if (plan.status === 'draft') {
        await storage.updateMarketingPlan(parseInt(id), { status: 'active' });
      }
      
      // In a real application, you would send an email to the client here
      // For this demo, we'll just simulate the email sending
      
      res.json({ success: true, message: "Marketing plan shared with client" });
    } catch (error) {
      console.error("Error sharing marketing plan:", error);
      res.status(500).json({ message: "Failed to share marketing plan" });
    }
  });

  // Update a marketing plan (admin only)
  app.patch('/api/marketing-plans/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const planData = req.body;
      
      const plan = await storage.getMarketingPlan(parseInt(id));
      if (!plan) {
        return res.status(404).json({ message: "Marketing plan not found" });
      }
      
      const updatedPlan = await storage.updateMarketingPlan(parseInt(id), planData);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating marketing plan:", error);
      res.status(500).json({ message: "Failed to update marketing plan" });
    }
  });
  
  // Delete marketing plan
  app.delete('/api/marketing-plans/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const plan = await storage.getMarketingPlan(parseInt(id));
      if (!plan) {
        return res.status(404).json({ message: "Marketing plan not found" });
      }
      
      await storage.deleteMarketingPlan(parseInt(id));
      res.json({ message: "Marketing plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting marketing plan:", error);
      res.status(500).json({ message: "Failed to delete marketing plan" });
    }
  });

  // Invoices
  // Create invoice (admin only)
  app.post('/api/invoices', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Get all invoices (admin only)
  app.get('/api/invoices', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get invoices for a user
  app.get('/api/users/:userId/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if admin or the user is accessing their own invoices
      if (currentUser?.role !== 'admin' && currentUserId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching user's invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get a specific invoice
  app.get('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if admin or the invoice belongs to the user
      if (currentUser?.role !== 'admin' && invoice.userId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Update invoice status (admin only)
  app.patch('/api/invoices/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['paid', 'unpaid', 'overdue'].includes(status)) {
        return res.status(400).json({ message: "Invalid status specified" });
      }
      
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(parseInt(id), status);
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Traffic stats
  // Add traffic stat (admin only)
  app.post('/api/traffic-stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const statData = insertTrafficStatSchema.parse(req.body);
      const stat = await storage.createTrafficStat(statData);
      res.status(201).json(stat);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating traffic stat:", error);
      res.status(500).json({ message: "Failed to create traffic stat" });
    }
  });

  // Get traffic stats with optional date range (admin only)
  app.get('/api/traffic-stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate && typeof startDate === 'string') {
        start = new Date(startDate);
      }
      
      if (endDate && typeof endDate === 'string') {
        end = new Date(endDate);
      }
      
      const stats = await storage.getTrafficStats(start, end);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching traffic stats:", error);
      res.status(500).json({ message: "Failed to fetch traffic stats" });
    }
  });
  
  // Reset traffic stats (admin only)
  app.delete('/api/traffic-stats/reset', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.resetTrafficStats();
      res.json({ success: true, message: "Traffic statistics have been reset successfully" });
    } catch (error) {
      console.error("Error resetting traffic stats:", error);
      res.status(500).json({ message: "Failed to reset traffic statistics" });
    }
  });

  // Site settings routes
  // Get settings by category
  app.get('/api/settings/:category', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error(`Error fetching ${req.params.category} settings:`, error);
      res.status(500).json({ message: `Failed to fetch settings` });
    }
  });
  
  // Get all settings
  app.get('/api/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Upsert setting
  app.post('/api/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { key, value, category, description } = req.body;
      const setting = await storage.upsertSetting({
        key,
        value,
        category,
        description
      });
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error upserting setting:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });
  
  // Batch upsert settings
  app.post('/api/settings/batch', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { settings } = req.body;
      const results = [];
      
      for (const setting of settings) {
        const result = await storage.upsertSetting(setting);
        results.push(result);
      }
      
      res.status(201).json(results);
    } catch (error) {
      console.error("Error batch upserting settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Blog routes
  app.get('/api/blog', async (_req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  app.get('/api/blog/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Validate that id is a valid number
      if (isNaN(id)) {
        console.error("Invalid blog post ID:", req.params.id);
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.post('/api/blog', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Generate a slug from the title
      const title = req.body.title;
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
        
      const post = await storage.createBlogPost({
        ...req.body,
        slug,
        authorId: req.user.claims.sub,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });
  
  app.patch('/api/blog/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // If the title is updated, update the slug as well
      let updates = req.body;
      if (req.body.title) {
        const slug = req.body.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        updates = { ...updates, slug };
      }
      
      const post = await storage.updateBlogPost(id, updates);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });
  
  app.delete('/api/blog/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  
  // Site Settings Routes
  // Get all settings
  app.get('/api/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Get settings by category
  app.get('/api/settings/category/:category', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = req.params.category;
      const settings = await storage.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      res.status(500).json({ message: "Failed to fetch settings by category" });
    }
  });

  // Get setting by key (public)
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  // Create or update setting
  app.post('/api/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settingData = req.body;
      const setting = await storage.upsertSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating/updating setting:", error);
      res.status(500).json({ message: "Failed to create/update setting" });
    }
  });

  // Delete setting
  app.delete('/api/settings/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSetting(id);
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // Document routes
  // Create new document
  app.post('/api/documents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const document = await storage.createDocument({
        ...req.body,
        uploadedBy: currentUser.claims.sub,
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  // Get all documents (admin) or user's documents (client)
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as any;
      // If admin, return all documents, otherwise return only user's documents
      const documents = currentUser.claims.role === 'admin' 
        ? await storage.getDocuments() 
        : await storage.getDocuments(currentUser.claims.sub);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  // Get user's documents
  app.get('/api/users/:userId/documents', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to access their own documents unless they're an admin
      const currentUser = req.user as any;
      if (currentUser.claims.sub !== userId && currentUser.claims.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  // Get a single document
  app.get('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(parseInt(id));
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only allow users to access their own documents unless they're an admin
      const currentUser = req.user as any;
      if (document.userId !== currentUser.claims.sub && currentUser.claims.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  // Mark document as read
  app.patch('/api/documents/:id/mark-as-read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(parseInt(id));
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only allow the document's assigned user to mark it as read
      const currentUser = req.user as any;
      if (document.userId !== currentUser.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.markDocumentAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking document as read:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  
  // Delete document
  app.delete('/api/documents/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Client invitation and password management endpoints
  
  // Send welcome email with password setup link (when admin creates a new client account)
  app.post('/api/users/:userId/send-welcome', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Send welcome email with password setup link
      const emailSent = await sendWelcomeEmail(
        user.email,
        user.firstName || 'Client',
        user.id
      );
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send welcome email" });
      }
      
      res.json({ success: true, message: "Welcome email sent successfully" });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  });
  
  // Send password reset email
  app.post('/api/password-reset', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent" });
      }
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(
        user.email,
        user.firstName || 'Client',
        user.id
      );
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send password reset email" });
      }
      
      res.json({ success: true, message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  });
  
  // Verify password reset token and set new password
  app.post('/api/password/reset', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      // Verify token
      const userId = verifyPasswordToken(token);
      
      if (!userId) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Find user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Update user's password
      await storage.updateUser(userId, { password: hashedPassword });
      
      // Invalidate token to prevent reuse
      invalidateToken(token);
      
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  // Check if token is valid (for frontend validation)
  app.get('/api/password/token-valid', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ valid: false });
      }
      
      const userId = verifyPasswordToken(token as string);
      
      res.json({ valid: !!userId });
    } catch (error) {
      console.error("Error validating token:", error);
      res.status(500).json({ valid: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
