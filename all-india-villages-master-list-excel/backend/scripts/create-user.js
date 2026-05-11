#!/usr/bin/env node
/**
 * Interactive user creation script
 */

require("dotenv").config();
const readline = require("readline");
const { prisma } = require("../config/db");
const { hashPassword, generateToken } = require("../config/auth");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    console.log("\n🔐 Create New User\n");

    const email = await question("Email: ");
    const name = await question("Full Name: ");
    const password = await question("Password (min 8 chars): ");

    if (!email || !name || password.length < 8) {
      console.error("❌ Invalid input. Please fill all fields with valid values.");
      return;
    }

    console.log("\n⏳ Creating user...");

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        countryId: 1,
        planType: "pro",
      },
    });

    console.log("✅ User created successfully!\n");
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Created: ${user.createdAt}\n`);

    // Generate API Key
    console.log("🔑 Generating API Key...");

    const apiKey = `key_${Math.random().toString(36).substr(2, 20)}`;
    const apiSecret = `secret_${Math.random().toString(36).substr(2, 40)}`;
    const secretHash = await hashPassword(apiSecret);

    const key = await prisma.apiKey.create({
      data: {
        key: apiKey,
        secretHash,
        userId: user.id,
      },
    });

    console.log("✅ API Key created!\n");
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`🔐 API Secret: ${apiSecret}`);
    console.log(`⚠️  Save this secret securely - it won't be shown again!\n`);

    // Generate JWT Token
    const jwtToken = generateToken(user.id);
    console.log("🎫 JWT Token (for admin routes):");
    console.log(`${jwtToken}\n`);

    // Usage example
    console.log("📚 Usage Example:\n");
    console.log("Query villages with API Key:");
    console.log(`curl http://127.0.0.1:8000/api/v1/states \\`);
    console.log(`  -H "X-API-Key: ${apiKey}"\n`);

    console.log("Admin operations with JWT:");
    console.log(`curl http://127.0.0.1:8000/api/admin/users \\`);
    console.log(`  -H "Authorization: Bearer ${jwtToken.substring(0, 20)}..."\n`);

  } catch (error) {
    if (error.code === "P2002") {
      console.error("❌ Email already exists!");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
