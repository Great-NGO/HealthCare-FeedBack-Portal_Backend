/**
 * Seed script to import health facilities from Excel to Neon database
 * Run with: npx tsx scripts/seed-facilities.ts
 */

import "dotenv/config";
import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";
import { PrismaClient, FacilityOwnershipType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create Prisma adapter and client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Path to the Excel file
const excelPath = path.resolve(__dirname, "../../GRID3_NGA_health_facilities_cleaned.xlsx");

/**
 * Maps ownership_type_fixed from Excel to our enum
 */
function mapOwnershipType(ownershipType: string): FacilityOwnershipType {
  const mapping: Record<string, FacilityOwnershipType> = {
    "Federal Government": "federal",
    "State Government": "state",
    "Local Government": "state", // Local government facilities are state-level
    "Military & Paramilitary formations": "federal",
    "For Profit": "private",
    "Not For Profit": "private",
    "Unknown": "unknown",
  };

  return mapping[ownershipType] || "unknown";
}

/**
 * Normalizes string values (trim, handle null/undefined)
 */
function normalizeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

interface ExcelRow {
  state: unknown;
  lga: unknown;
  facility_name: unknown;
  ownership_type_fixed: unknown;
}

async function seedFacilities() {
  console.log("📂 Reading Excel file from:", excelPath);
  console.log("");

  try {
    // Read the workbook
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
    console.log(`📊 Total rows in Excel: ${data.length}`);

    // Check if facilities already exist
    const existingCount = await prisma.healthFacility.count();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} facilities.`);
      console.log("   Do you want to clear and re-import? (This will delete existing data)");
      console.log("   To proceed, run: npx tsx scripts/seed-facilities.ts --force");
      
      if (!process.argv.includes("--force")) {
        console.log("\n❌ Aborted. Use --force flag to proceed.");
        process.exit(0);
      }

      console.log("\n🗑️  Clearing existing facilities...");
      await prisma.healthFacility.deleteMany();
      console.log("   Cleared.");
    }

    // Prepare data for batch insert
    console.log("\n🔄 Preparing data for import...");
    
    const facilities = data.map((row) => ({
      state: normalizeString(row.state),
      lga: normalizeString(row.lga),
      facility_name: normalizeString(row.facility_name),
      ownership_type: mapOwnershipType(normalizeString(row.ownership_type_fixed)),
    })).filter(f => f.state && f.lga && f.facility_name); // Filter out empty rows

    console.log(`📋 Valid facilities to import: ${facilities.length}`);

    // Batch insert in chunks of 1000 for better performance
    const BATCH_SIZE = 1000;
    const totalBatches = Math.ceil(facilities.length / BATCH_SIZE);
    
    console.log(`\n📤 Importing in ${totalBatches} batches of ${BATCH_SIZE}...`);
    
    let imported = 0;
    for (let i = 0; i < facilities.length; i += BATCH_SIZE) {
      const batch = facilities.slice(i, i + BATCH_SIZE);
      await prisma.healthFacility.createMany({
        data: batch,
        skipDuplicates: true,
      });
      
      imported += batch.length;
      const progress = Math.round((imported / facilities.length) * 100);
      process.stdout.write(`\r   Progress: ${imported}/${facilities.length} (${progress}%)`);
    }

    console.log("\n\n✅ Import completed successfully!");

    // Show summary
    const summary = await prisma.healthFacility.groupBy({
      by: ["state"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    console.log("\n📈 Summary by state (top 10):");
    summary.slice(0, 10).forEach((s) => {
      console.log(`   ${s.state}: ${s._count.id} facilities`);
    });

    const totalImported = await prisma.healthFacility.count();
    console.log(`\n🎉 Total facilities in database: ${totalImported}`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedFacilities();
