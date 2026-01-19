import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma configuration
 * Uses DATABASE_URL from .env file
 * 
 * For Supabase, the DATABASE_URL should be:
 * postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
 * 
 * For Neon, the DATABASE_URL should be:
 * postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
