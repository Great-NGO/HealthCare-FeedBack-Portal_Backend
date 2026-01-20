// Load environment variables FIRST before any other imports
import "dotenv/config";

import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { config, validateEnv } from "./config/index.js";
import { prisma, disconnectPrisma } from "./config/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import { createSuccessResponse, type ApiResponse } from "./types/responses.js";
import routes from "./routes/index.js";
import { warmupHealthFacilityCache, stopKeepAlive } from "./services/healthFacility.service.js";

// Validate environment variables
validateEnv();

/**
 * Initialize Express application
 */
const app: Express = express();

// Trust proxy (for correct IP detection behind reverse proxy)
app.set("trust proxy", 1);

/**
 * Middleware
 */

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.isProduction 
      ? config.corsOrigin 
      : [config.corsOrigin, 'http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging
app.use(morgan(config.isProduction ? "combined" : "dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Health check endpoint
 */
app.get("/health", async (_req: Request, res: Response<ApiResponse>) => {
  // Test database connection
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  res.status(200).json(
    createSuccessResponse(
      {
        status: "healthy",
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "Server is healthy",
      "/health",
      200
    )
  );
});

/**
 * API Root
 */
app.get("/api/v1", (_req: Request, res: Response<ApiResponse>) => {
  res.status(200).json(
    createSuccessResponse(
      {
        name: "Healthcare Feedback Portal API",
        version: "1.0.0",
        documentation: "/api/v1/docs",
        database: "Prisma + PostgreSQL",
      },
      "Welcome to the Healthcare Feedback Portal API",
      "/api/v1",
      200
    )
  );
});

/**
 * API Routes
 */
app.use("/api/v1", routes);

/**
 * 404 Handler for undefined routes
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Start server
 */
const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Healthcare Feedback Portal API                          ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   Port: ${PORT.toString().padEnd(47)}║
║   API Base: http://localhost:${PORT}/api/v1${" ".repeat(23)}║
║   Database: Prisma + PostgreSQL                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Pre-warm cache and start database keep-alive
  await warmupHealthFacilityCache();
});

/**
 * Graceful shutdown
 */
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Stop keep-alive pings
  stopKeepAlive();
  
  server.close(async () => {
    console.log("HTTP server closed");
    await disconnectPrisma();
    console.log("Database connection closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
