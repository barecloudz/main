import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  try {
    // Check if admin already exists
    const adminId = "admin_barecloudz_1";
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, adminId)
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    // Create admin user with hashed password
    await db.insert(users).values({
      id: adminId,
      email: "admin@barecloudz.com",
      password: hashedPassword, // Securely stored hashed password
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Login credentials:");
    console.log("Email: admin@barecloudz.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();