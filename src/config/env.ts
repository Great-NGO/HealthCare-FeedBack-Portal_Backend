import dotenv from "dotenv";

dotenv.config();

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  /** Server port */
  port: parseInt(process.env.PORT || "3000", 10),

  /** Node environment */
  nodeEnv: process.env.NODE_ENV || "development",

  /** Is production environment */
  isProduction: process.env.NODE_ENV === "production",

  /** Supabase URL */
  supabaseUrl: process.env.SUPABASE_URL || "",

  /** Supabase anonymous key (for client-side operations) */
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",

  /** Supabase service role key (for admin operations) */
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  /** CORS origin */
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:8080",

  /** JWT secret (if using custom JWT) */
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",

  /** JWT expiration */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  /** AWS Development URL */
  awsDevUrl: process.env.AWS_DEV_URL || "",

  /** AWS Production URL */
  awsProdUrl: process.env.AWS_PROD_URL || "",
} as const;

/**
 * Validates that required environment variables are set
 * @throws Error if required variables are missing
 */
export function validateEnv(): void {
  const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "AWS_DEV_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // JWT_SECRET is required in production
  if (config.isProduction) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required in production");
    }
    if (config.jwtSecret.length < 32) {
      console.warn("WARNING: JWT_SECRET should be at least 32 characters in production");
    }
  } else if (!process.env.JWT_SECRET) {
    console.warn("WARNING: Using default JWT_SECRET for development. Set JWT_SECRET in .env for security.");
  }
}
