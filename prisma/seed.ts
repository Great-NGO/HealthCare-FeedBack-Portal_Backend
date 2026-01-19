import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "nwamadigreat@gmail.com";
  const password = "HFC@2026";
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Check if admin exists
  const existing = await prisma.admin.findUnique({
    where: { email },
  });
  
  if (existing) {
    console.log(`Admin ${email} already exists. Updating password...`);
    await prisma.admin.update({
      where: { email },
      data: { 
        password_hash: passwordHash,
        role: "super_admin",
        is_active: true,
      },
    });
    console.log("✅ Admin password updated!");
  } else {
    await prisma.admin.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: "Super Admin",
        role: "super_admin",
        is_active: true,
      },
    });
    console.log("✅ Super admin created!");
  }
  
  console.log(`
  ========================================
  Super Admin Created Successfully!
  ========================================
  Email: ${email}
  Password: ${password}
  Role: super_admin
  ========================================
  `);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
