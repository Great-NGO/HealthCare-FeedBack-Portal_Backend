/**
 * Verify NGOs in the database. Optionally remove duplicates.
 * Run: npx tsx scripts/verify-ngos.ts
 * Fix: npx tsx scripts/verify-ngos.ts --fix
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const rawUrl = process.env.DATABASE_URL ?? "";
const base = rawUrl.replace(/[?&]sslmode=[^&]*/gi, "").replace(/[?&]$/, "");
const connectionString = base + (base.includes("?") ? "&" : "?") + "sslmode=verify-full";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const doFix = process.argv.includes("--fix");

async function verify() {
  try {
    const total = await prisma.recognizedNgo.count();
    console.log(`Total NGOs in database: ${total}`);

    const all = await prisma.recognizedNgo.findMany({
      select: { id: true, name: true, sort_order: true },
      orderBy: { sort_order: "asc" },
    });
    const byName = new Map<string, { id: string; name: string; sort_order: number }[]>();
    for (const r of all) {
      const list = byName.get(r.name) ?? [];
      list.push(r);
      byName.set(r.name, list);
    }
    const duplicates = [...byName.entries()].filter(([, list]) => list.length > 1);
    if (duplicates.length > 0) {
      console.log(`\nDuplicate names found: ${duplicates.length}`);
      duplicates.forEach(([name, list]) =>
        console.log(`  "${name}" (${list.length} rows)`)
      );
      if (doFix) {
        let deleted = 0;
        for (const [, list] of duplicates) {
          const keep = list[0];
          for (let i = 1; i < list.length; i++) {
            await prisma.recognizedNgo.delete({ where: { id: list[i].id } });
            deleted++;
          }
        }
        console.log(`\nRemoved ${deleted} duplicate row(s). Kept one per name (lowest sort_order).`);
      } else {
        console.log("\nRun with --fix to remove duplicates (keeps one per name).");
      }
    } else {
      console.log("\nNo duplicate names in database.");
    }

    const sample = await prisma.recognizedNgo.findMany({
      take: 5,
      orderBy: { sort_order: "asc" },
      select: { name: true, sort_order: true },
    });
    console.log("\nSample (first 5 by sort_order):");
    sample.forEach((r) => console.log(`  ${r.sort_order + 1}. ${r.name}`));

    const other = await prisma.recognizedNgo.findUnique({
      where: { name: "Other" },
      select: { name: true, sort_order: true },
    });
    if (other) {
      console.log(`\n"Other" option: present (sort_order: ${other.sort_order})`);
    } else {
      console.log('\n"Other" option: not found');
    }
  } catch (err) {
    console.error("Verify failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verify();
