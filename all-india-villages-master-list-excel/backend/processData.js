/**
 * Data Processing Script - Node.js version
 * Reads Excel files, cleans data, and generates JSON API files
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// 📁 Dataset folder path
const datasetPath = path.join(__dirname, "..", "dataset");
const outputDir = path.join(__dirname, "..", "data");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("📂 Reading from dataset:", datasetPath);

let allData = [];

// 🚀 STEP 1: Read all Excel files
const files = fs.readdirSync(datasetPath);
const excelFiles = files.filter((f) =>
  f.toLowerCase().endsWith(".xlsx") || f.toLowerCase().endsWith(".xls")
);

if (excelFiles.length === 0) {
  console.error("❌ No Excel files found in dataset folder");
  process.exit(1);
}

excelFiles.forEach((file) => {
  const filePath = path.join(datasetPath, file);
  console.log(`📖 Reading: ${file}`);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  allData = allData.concat(data);
});

console.log(`\n📊 Total records read: ${allData.length}`);

// 🚀 STEP 2: Clean data
// Extract column names from first row (assuming standard format)
if (allData.length === 0) {
  console.error("❌ No data found in Excel files");
  process.exit(1);
}

// Standardize column names
const cleanData = allData.map((row) => {
  const keys = Object.keys(row);
  const cleanRow = {};

  // Map various possible column names to standard format
  keys.forEach((key) => {
    const lowerKey = key.toLowerCase().trim();
    if (
      lowerKey.includes("state") &&
      !lowerKey.includes("code") &&
      !lowerKey.includes("_name")
    ) {
      cleanRow.state_name =
        (row[key] || "").toString().trim().toUpperCase();
    } else if (lowerKey.includes("state") && lowerKey.includes("code")) {
      cleanRow.state_code = (row[key] || "").toString().trim();
    } else if (
      lowerKey.includes("district") &&
      !lowerKey.includes("code") &&
      !lowerKey.includes("_name")
    ) {
      cleanRow.district_name =
        (row[key] || "").toString().trim().toUpperCase();
    } else if (lowerKey.includes("district") && lowerKey.includes("code")) {
      cleanRow.district_code = (row[key] || "").toString().trim();
    } else if (
      lowerKey.includes("subdistrict") &&
      !lowerKey.includes("code") &&
      !lowerKey.includes("_name")
    ) {
      cleanRow.subdistrict_name =
        (row[key] || "").toString().trim().toUpperCase();
    } else if (
      lowerKey.includes("subdistrict") &&
      lowerKey.includes("code")
    ) {
      cleanRow.subdistrict_code = (row[key] || "").toString().trim();
    } else if (
      lowerKey.includes("village") &&
      !lowerKey.includes("code") &&
      !lowerKey.includes("_name")
    ) {
      cleanRow.village_name =
        (row[key] || "").toString().trim().toUpperCase();
    } else if (lowerKey.includes("village") && lowerKey.includes("code")) {
      cleanRow.village_code = (row[key] || "").toString().trim();
    }
  });

  return cleanRow;
});

// 🚀 STEP 3: Remove duplicates
const uniqueData = Array.from(
  new Map(
    cleanData
      .filter((r) => r.state_name && r.district_name && r.village_name)
      .map((r) => [
        `${r.state_name}|${r.district_name}|${r.subdistrict_name || ""}|${r.village_name}`,
        r,
      ])
  ).values()
);

console.log(`\n✨ After cleaning: ${uniqueData.length} unique records`);

// 🚀 STEP 4: Create hierarchical JSON structure
const data = {};

uniqueData.forEach((row) => {
  const state = row.state_name;
  const district = row.district_name;
  const subdistrict = row.subdistrict_name || "Unknown";
  const village = row.village_name;

  if (!data[state]) data[state] = {};
  if (!data[state][district]) data[state][district] = {};
  if (!data[state][district][subdistrict]) {
    data[state][district][subdistrict] = [];
  }

  const villageObj = {
    name: village,
    code: row.village_code || "",
  };

  if (
    !data[state][district][subdistrict].some((v) => v.name === village)
  ) {
    data[state][district][subdistrict].push(villageObj);
  }
});

// 🚀 STEP 5: Create flat search index
const flatIndex = [];
Object.entries(data).forEach(([state, districts]) => {
  Object.entries(districts).forEach(([district, subdistricts]) => {
    Object.entries(subdistricts).forEach(([subdistrict, villages]) => {
      villages.forEach((village) => {
        flatIndex.push({
          state,
          district,
          subdistrict,
          village: village.name,
          code: village.code || "",
          _searchKey: `${state} ${district} ${subdistrict} ${village.name}`
            .toLowerCase(),
        });
      });
    });
  });
});

// 🚀 STEP 6: Save JSON files
const villageDataPath = path.join(outputDir, "villages.json");
const indexPath = path.join(outputDir, "flatIndex.json");

fs.writeFileSync(villageDataPath, JSON.stringify(data, null, 2), "utf-8");
console.log(`✅ Saved: ${villageDataPath}`);

fs.writeFileSync(indexPath, JSON.stringify(flatIndex, null, 2), "utf-8");
console.log(`✅ Saved: ${indexPath}`);

// 🚀 STEP 7: Generate statistics
const stats = {
  states: Object.keys(data).length,
  districts: Object.values(data).reduce(
    (sum, dists) => sum + Object.keys(dists).length,
    0
  ),
  subdistricts: Object.values(data).reduce(
    (sum, dists) =>
      sum +
      Object.values(dists).reduce(
        (s, subdists) => s + Object.keys(subdists).length,
        0
      ),
    0
  ),
  villages: flatIndex.length,
};

const statsPath = path.join(outputDir, "stats.json");
fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), "utf-8");
console.log(`✅ Saved: ${statsPath}`);

console.log("\n📈 Dataset Statistics:");
console.log(`   States: ${stats.states}`);
console.log(`   Districts: ${stats.districts}`);
console.log(`   Subdistricts: ${stats.subdistricts}`);
console.log(`   Villages: ${stats.villages}`);

console.log("\n🎉 Data processing complete! Files ready for API.");
