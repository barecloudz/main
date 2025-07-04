import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Compare password with hashed password in database
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Authenticate user middleware
export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Get user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    if (!user.password) {
      return res.status(401).json({ message: "Password not set for this account" });
    }

    const isMatch = await comparePassword(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    req.login({ 
      claims: { 
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl
      } 
    }, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Error during login process" });
      }
      
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      });
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

// Middleware to check if user is logged in
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(500).json({ message: "Server error" });
  }
};