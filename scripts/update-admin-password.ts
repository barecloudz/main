import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function updateAdminPassword() {
  try {
    // Admin ID
    const adminId = "admin_barecloudz_1";
    
    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    // Update admin user with hashed password
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, adminId));
    
    console.log("Admin password updated successfully!");
    console.log("Login credentials:");
    console.log("Email: admin@barecloudz.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin password:", error);
    process.exit(1);
  }
}

updateAdminPassword();