/**
 * Read and list NGOs from "Updated List Of NGOs.xlsx" (no DB).
 * Run: npx tsx scripts/inspect-ngos-xlsx.ts [path-to.xlsx]
 */

import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultPath = path.resolve(__dirname, "../data/Updated List Of NGOs.xlsx");

function readNgoNamesFromXlsx(filePath: string): string[] {
  const workbook = XLSX.readFile(filePath, { type: "file" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  const firstRow = data[0] as string[] | undefined;
  const nameColIndex =
    firstRow?.findIndex((c) => /name|organization|ngo|title/i.test(String(c ?? ""))) ?? 1;
  const colIndex = nameColIndex >= 0 ? nameColIndex : 1;

  const names: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;
    const cell = row[colIndex];
    const name = typeof cell === "string" ? cell.trim() : cell != null ? String(cell).trim() : "";
    if (!name) continue;
    if (i === 0 && /name|organization|ngo|s\/n|sn|#/i.test(name)) continue;
    if (/^\d+$/.test(name)) continue;
    if (name.toLowerCase() === "other") continue;
    names.push(name);
  }
  names.push("Other");
  return [...new Set(names)];
}

const xlsxPath = process.argv[2] || defaultPath;
const names = readNgoNamesFromXlsx(xlsxPath);
console.log(`Total NGOs (including "Other"): ${names.length}`);
console.log("");
names.forEach((n, i) => console.log(`${i + 1}. ${n}`));
