/**
 * Seed recognized NGOs from "Updated List Of NGOs.xlsx" into Neon DB.
 * Place the file at: HealthCare-FeedBack-Portal_Backend/data/Updated List Of NGOs.xlsx
 * Run: npx tsx scripts/seed-ngos.ts
 */

import "dotenv/config";
import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawUrl = process.env.DATABASE_URL ?? "";
const base = rawUrl.replace(/[?&]sslmode=[^&]*/gi, "").replace(/[?&]$/, "");
const connectionString = base + (base.includes("?") ? "&" : "?") + "sslmode=verify-full";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultXlsxPath = path.resolve(__dirname, "../data/Updated List Of NGOs.xlsx");

function readNgoNamesFromXlsx(filePath: string): string[] {
  const workbook = XLSX.readFile(filePath, { type: "file" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  const firstRow = data[0] as string[] | undefined;
  const nameColIndex =
    firstRow?.findIndex((c) => /name|organization|ngo|title/i.test(String(c ?? ""))) ?? 1;
  const colIndex = nameColIndex >= 0 ? nameColIndex : 1;

  const seen = new Map<string, string>();
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;
    const cell = row[colIndex];
    const name = typeof cell === "string" ? cell.trim() : cell != null ? String(cell).trim() : "";
    if (!name) continue;
    if (i === 0 && /name|organization|ngo|s\/n|sn|#/i.test(name)) continue;
    if (/^\d+$/.test(name)) continue;
    if (name.toLowerCase() === "other") continue;
    const key = name.toLowerCase();
    if (!seen.has(key)) seen.set(key, name);
  }
  const names = [...seen.values()];
  names.push("Other");
  return names;
}

function formatProgress(current: number, total: number, width = 30): string {
  const pct = total ? Math.round((current / total) * 100) : 0;
  const filled = Math.round((current / total) * width) || 0;
  const bar = "=".repeat(filled) + (filled < width ? ">" : "") + " ".repeat(width - filled);
  return `[${bar}] ${pct}% (${current}/${total})`;
}

async function seedNgos() {
  const xlsxPath = process.argv[2] || defaultXlsxPath;

  try {
    const names = readNgoNamesFromXlsx(xlsxPath);
    console.log(`Read ${names.length} NGO names from ${xlsxPath}`);

    await prisma.recognizedNgo.deleteMany({});
    console.log("Seeding...");

    for (let i = 0; i < names.length; i++) {
      await prisma.recognizedNgo.upsert({
        where: { name: names[i] },
        create: { name: names[i], sort_order: i },
        update: { sort_order: i },
      });
      process.stdout.write(`\r ${formatProgress(i + 1, names.length)}`);
    }

    process.stdout.write("\r" + " ".repeat(formatProgress(names.length, names.length).length + 2) + "\r");
    console.log(`Seeded ${names.length} NGOs into recognized_ngos.`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedNgos();
