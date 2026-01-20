import { prisma } from "../config/prisma.js";
import type { FacilityOwnershipType } from "@prisma/client";

/**
 * Simple in-memory cache for frequently accessed data
 */
const cache = {
  states: null as string[] | null,
  statesExpiry: 0,
  lgas: new Map<string, { data: string[]; expiry: number }>(),
  CACHE_TTL: 60 * 60 * 1000, // 1 hour cache
  isWarmedUp: false,
};

/**
 * Keep-alive interval to prevent Neon cold starts (every 4 minutes)
 */
let keepAliveInterval: NodeJS.Timeout | null = null;

async function pingDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[HealthFacility] Database keep-alive ping successful");
  } catch (error) {
    console.error("[HealthFacility] Database keep-alive ping failed:", error);
  }
}

/**
 * Start the database keep-alive mechanism
 */
function startKeepAlive(): void {
  if (keepAliveInterval) return;
  
  // Ping every 4 minutes to keep Neon warm (Neon sleeps after 5 min of inactivity)
  keepAliveInterval = setInterval(pingDatabase, 4 * 60 * 1000);
  console.log("[HealthFacility] Database keep-alive started (every 4 minutes)");
}

/**
 * Stop the keep-alive mechanism (for graceful shutdown)
 */
export function stopKeepAlive(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log("[HealthFacility] Database keep-alive stopped");
  }
}

/**
 * Health facility lookup service for cascading dropdowns
 * Provides efficient queries for State → LGA → Facility selection
 * Includes caching for frequently accessed data
 */
export const healthFacilityService = {
  /**
   * Gets all unique states from health facilities (cached)
   * @returns Array of state names sorted alphabetically
   */
  async getAllStates(): Promise<string[]> {
    const now = Date.now();
    
    // Return cached data if valid
    if (cache.states && cache.statesExpiry > now) {
      return cache.states;
    }

    const states = await prisma.healthFacility.findMany({
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    });

    const result = states.map((s) => s.state);
    
    // Cache the result
    cache.states = result;
    cache.statesExpiry = now + cache.CACHE_TTL;

    return result;
  },

  /**
   * Gets all LGAs for a specific state (cached)
   * @param state - The state name to filter by
   * @returns Array of LGA names sorted alphabetically
   */
  async getLGAsForState(state: string): Promise<string[]> {
    const now = Date.now();
    const cacheKey = state.toLowerCase();
    const cached = cache.lgas.get(cacheKey);
    
    // Return cached data if valid
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const lgas = await prisma.healthFacility.findMany({
      where: {
        state: {
          equals: state,
          mode: "insensitive",
        },
      },
      select: { lga: true },
      distinct: ["lga"],
      orderBy: { lga: "asc" },
    });

    const result = lgas.map((l) => l.lga);
    
    // Cache the result
    cache.lgas.set(cacheKey, { data: result, expiry: now + cache.CACHE_TTL });

    return result;
  },

  /**
   * Gets all facilities for a specific state and LGA
   * @param state - The state name
   * @param lga - The LGA name
   * @returns Array of facilities with name and ownership type
   */
  async getFacilitiesForLGA(
    state: string,
    lga: string
  ): Promise<{ name: string; type: FacilityOwnershipType }[]> {
    const facilities = await prisma.healthFacility.findMany({
      where: {
        state: {
          equals: state,
          mode: "insensitive",
        },
        lga: {
          equals: lga,
          mode: "insensitive",
        },
      },
      select: {
        facility_name: true,
        ownership_type: true,
      },
      orderBy: { facility_name: "asc" },
    });

    return facilities.map((f) => ({
      name: f.facility_name,
      type: f.ownership_type,
    }));
  },

  /**
   * Search facilities by name (for autocomplete)
   * @param query - Search query string
   * @param state - Optional state filter
   * @param lga - Optional LGA filter
   * @param limit - Max results to return (default 20)
   */
  async searchFacilities(
    query: string,
    state?: string,
    lga?: string,
    limit: number = 20
  ): Promise<{ name: string; type: FacilityOwnershipType; state: string; lga: string }[]> {
    const where: any = {
      facility_name: {
        contains: query,
        mode: "insensitive",
      },
    };

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (lga) {
      where.lga = { equals: lga, mode: "insensitive" };
    }

    const facilities = await prisma.healthFacility.findMany({
      where,
      select: {
        facility_name: true,
        ownership_type: true,
        state: true,
        lga: true,
      },
      take: limit,
      orderBy: { facility_name: "asc" },
    });

    return facilities.map((f) => ({
      name: f.facility_name,
      type: f.ownership_type,
      state: f.state,
      lga: f.lga,
    }));
  },

  /**
   * Get facility statistics
   */
  async getStats(): Promise<{
    totalFacilities: number;
    totalStates: number;
    totalLGAs: number;
    byOwnershipType: { type: FacilityOwnershipType; count: number }[];
  }> {
    const [totalFacilities, states, lgas, byOwnership] = await Promise.all([
      prisma.healthFacility.count(),
      prisma.healthFacility.findMany({
        select: { state: true },
        distinct: ["state"],
      }),
      prisma.healthFacility.findMany({
        select: { lga: true },
        distinct: ["lga"],
      }),
      prisma.healthFacility.groupBy({
        by: ["ownership_type"],
        _count: { id: true },
      }),
    ]);

    return {
      totalFacilities,
      totalStates: states.length,
      totalLGAs: lgas.length,
      byOwnershipType: byOwnership.map((b) => ({
        type: b.ownership_type,
        count: b._count.id,
      })),
    };
  },
};

/**
 * Pre-warm the cache on server startup
 * Loads states into cache and starts keep-alive
 */
export async function warmupHealthFacilityCache(): Promise<void> {
  if (cache.isWarmedUp) return;

  console.log("[HealthFacility] Warming up cache...");
  const startTime = Date.now();

  try {
    // Pre-load states into cache
    await healthFacilityService.getAllStates();
    
    cache.isWarmedUp = true;
    const duration = Date.now() - startTime;
    console.log(`[HealthFacility] Cache warmed up in ${duration}ms`);

    // Start keep-alive to prevent Neon cold starts
    startKeepAlive();
  } catch (error) {
    console.error("[HealthFacility] Cache warmup failed:", error);
  }
}
