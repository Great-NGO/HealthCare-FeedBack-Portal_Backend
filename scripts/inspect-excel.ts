/**
 * Script to inspect the Excel file structure and columns
 * Run with: npx tsx scripts/inspect-excel.ts
 */

import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file
const excelPath = path.resolve(__dirname, "../../GRID3_NGA_health_facilities_cleaned.xlsx");

console.log("📂 Reading Excel file from:", excelPath);
console.log("");

try {
  // Read the workbook
  const workbook = XLSX.readFile(excelPath);

  // Get sheet names
  console.log("📋 Sheet names:", workbook.SheetNames);
  console.log("");

  // Read the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON to get headers and data
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  console.log(`📊 Total rows: ${data.length}`);
  console.log("");

  // Get all column names from the first row
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log("📝 Column names:");
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col}`);
    });
    console.log("");

    // Show first 5 sample rows
    console.log("🔍 Sample data (first 5 rows):");
    console.log("=".repeat(100));
    
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`\nRow ${i + 1}:`);
      const row = data[i];
      for (const [key, value] of Object.entries(row)) {
        console.log(`   ${key}: ${value}`);
      }
    }

    // Show unique values for key columns (if they exist)
    console.log("\n" + "=".repeat(100));
    console.log("📈 Unique values analysis for location-related columns:");
    
    // Check for common column names that might be state/lga/facility related
    const locationColumns = columns.filter(col => 
      col.toLowerCase().includes('state') ||
      col.toLowerCase().includes('lga') ||
      col.toLowerCase().includes('name') ||
      col.toLowerCase().includes('type') ||
      col.toLowerCase().includes('facility') ||
      col.toLowerCase().includes('category') ||
      col.toLowerCase().includes('ownership')
    );

    for (const col of locationColumns) {
      const uniqueValues = [...new Set(data.map(row => row[col]))];
      console.log(`\n   ${col}: ${uniqueValues.length} unique values`);
      if (uniqueValues.length <= 50) {
        console.log(`   Values: ${uniqueValues.slice(0, 20).join(', ')}${uniqueValues.length > 20 ? '...' : ''}`);
      }
    }
  }
} catch (error) {
  console.error("❌ Error reading Excel file:", error);
}
