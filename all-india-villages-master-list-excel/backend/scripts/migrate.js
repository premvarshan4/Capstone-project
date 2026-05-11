#!/usr/bin/env node
/**
 * Database migration and seeding script
 * Converts Excel data to PostgreSQL using Prisma
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { prisma } = require("../config/db");

async function main() {
  try {
    console.log("📁 Starting data migration...");

    // Ensure India country record exists
    const country = await prisma.country.upsert({
      where: { code: "IN" },
      update: {},
      create: {
        code: "IN",
        name: "India",
      },
    });

    console.log(`✅ Country: ${country.name}`);

    // Read Excel files from dataset folder
    const datasetPath = path.join(__dirname, "..", "..", "dataset");
    const excelFiles = fs
      .readdirSync(datasetPath)
      .filter((f) => f.endsWith(".xlsx") || f.endsWith(".xls"));

    if (excelFiles.length === 0) {
      console.error("❌ No Excel files found in dataset folder");
      return;
    }

    console.log(`📊 Found ${excelFiles.length} Excel files`);

    let totalVillages = 0;
    const stateMap = {};
    const districtMap = {};
    const subdistrictMap = {};

    // Process each Excel file
    for (const file of excelFiles) {
      console.log(`\n📖 Processing: ${file}`);

      const filePath = path.join(datasetPath, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      console.log(`  Found ${rows.length} rows`);

      // Process rows
      for (const row of rows) {
        try {
          // Extract data (handle various column name formats)
          const stateName =
            (row["STATE NAME"] ||
              row["State Name"] ||
              row["state_name"] ||
              "").trim() || null;
          const districtName =
            (row["DISTRICT NAME"] ||
              row["District Name"] ||
              row["district_name"] ||
              "").trim() || null;
          const subdistrictName =
            (row["SUB-DISTRICT NAME"] ||
              row["Sub-District Name"] ||
              row["subdistrict_name"] ||
              row["MDDS Sub_DT"] ||
              "").trim() || null;
          const villageName =
            (row["Area Name"] ||
              row["AREA NAME"] ||
              row["Village Name"] ||
              row["village_name"] ||
              row["MDDS PLCN"] ||
              "").trim() || null;

          const stateCode =
            (row["MDDS STC"] || row["state_code"] || "").toString().trim() ||
            "";
          const districtCode =
            (row["MDDS DTC"] || row["district_code"] || "").toString().trim() ||
            "";
          const subdistrictCode =
            (row["MDDS Sub_DT"] || row["subdistrict_code"] || "")
              .toString()
              .trim() || "";
          const villageCode =
            (row["MDDS PLCN"] || row["village_code"] || "")
              .toString()
              .trim() || "";

          if (!stateName || !districtName || !villageName) {
            console.warn(`  ⚠️  Skipping incomplete row: ${JSON.stringify(row).substring(0, 100)}`);
            continue;
          }

          // Upsert State
          let state = stateMap[stateName];
          if (!state) {
            state = await prisma.state.upsert({
              where: { countryId_code: { countryId: country.id, code: stateCode } },
              update: { name: stateName },
              create: {
                countryId: country.id,
                code: stateCode,
                name: stateName,
              },
            });
            stateMap[stateName] = state;
            console.log(`  ✅ State: ${stateName}`);
          }

          // Upsert District
          const districtKey = `${state.id}-${districtName}`;
          let district = districtMap[districtKey];
          if (!district) {
            district = await prisma.district.upsert({
              where: { stateId_code: { stateId: state.id, code: districtCode } },
              update: { name: districtName },
              create: {
                stateId: state.id,
                code: districtCode,
                name: districtName,
              },
            });
            districtMap[districtKey] = district;
            console.log(`     ✅ District: ${districtName}`);
          }

          // Upsert SubDistrict
          const subdistrictKey = `${district.id}-${subdistrictName}`;
          let subdistrict = subdistrictMap[subdistrictKey];
          if (!subdistrict) {
            subdistrict = await prisma.subDistrict.upsert({
              where: { districtId_code: { districtId: district.id, code: subdistrictCode } },
              update: { name: subdistrictName },
              create: {
                districtId: district.id,
                code: subdistrictCode,
                name: subdistrictName,
              },
            });
            subdistrictMap[subdistrictKey] = subdistrict;
          }

          // Create Village
          await prisma.village.upsert({
            where: { subDistrictId_code: { subDistrictId: subdistrict.id, code: villageCode } },
            update: { name: villageName },
            create: {
              subDistrictId: subdistrict.id,
              code: villageCode,
              name: villageName,
            },
          });

          totalVillages++;

          if (totalVillages % 1000 === 0) {
            console.log(`  📊 Processed ${totalVillages} villages so far...`);
          }
        } catch (error) {
          console.error(`  ❌ Error processing row:`, error.message);
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total villages inserted: ${totalVillages}`);
    console.log(`   - States: ${Object.keys(stateMap).length}`);
    console.log(`   - Districts: ${Object.keys(districtMap).length}`);
    console.log(`   - Subdistricts: ${Object.keys(subdistrictMap).length}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
