/**
 * Bharat Villages - Enterprise Express.js API Server
 * PostgreSQL + Prisma + JWT Authentication
 * Run: npm start (or npm run dev for development)
 * API: http://127.0.0.1:8000
 * Docs: http://127.0.0.1:8000/api/docs
 */

require("express-async-errors");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { prisma } = require("./config/db");
const { verifyApiKey, verifyJWT } = require("./config/auth");

const app = express();
const PORT = process.env.PORT || 8000;


// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://capstone-project-pied-tau.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
})
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests, please try again later",
});
app.use(limiter);


// ── Public Routes ─────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Bharat Villages API is running 🇮🇳",
    version: "2.0.0",
    docs: "/api/docs",
  });
});

// API documentation
app.get("/api/docs", (req, res) => {
  res.json({
    title: "Bharat Villages API v2.0",
    description: "Enterprise-grade Village-level geographical data API",
    endpoints: {
      public: {
        health: "GET /",
        docs: "GET /api/docs",
      },
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      village_data: {
        stats: "GET /api/v1/stats (requires API key)",
        states: "GET /api/v1/states",
        districts: "GET /api/v1/districts/:state",
        subdistricts: "GET /api/v1/subdistricts/:state/:district",
        villages: "GET /api/v1/villages/:state/:district/:subdistrict",
        search: "GET /api/v1/search?q=query",
      },
      admin: {
        users: "GET /api/admin/users (requires JWT)",
        logs: "GET /api/admin/logs",
      },
    },
  });
});

// ── Authentication Routes ─────────────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { hashPassword } = require('./config/auth');
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        countryId: 1,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { verifyPassword, generateToken } = require("./config/auth");
    const validPassword = await verifyPassword(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── Protected Routes (API Key Required) ────────────────────────────────────────

app.get("/api/v1/stats", verifyApiKey, async (req, res) => {
  try {
    const states = await prisma.state.count();
    const districts = await prisma.district.count();
    const subdistricts = await prisma.subDistrict.count();
    const villages = await prisma.village.count();

    res.json({
      states,
      districts,
      subdistricts,
      villages,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// List states
app.get("/api/v1/states", verifyApiKey, async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: { name: true, code: true },
      orderBy: { name: "asc" },
    });

    res.json(states);
  } catch (error) {
    console.error("States error:", error);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// List districts by state
app.get("/api/v1/districts/:state", verifyApiKey, async (req, res) => {
  const { state } = req.params;

  try {
    const stateRecord = await prisma.state.findFirst({
      where: { name: { mode: "insensitive", equals: state } },
    });

    if (!stateRecord) {
      return res.status(404).json({ error: `State '${state}' not found` });
    }

    const districts = await prisma.district.findMany({
      where: { stateId: stateRecord.id },
      select: { name: true, code: true },
      orderBy: { name: "asc" },
    });

    res.json(districts);
  } catch (error) {
    console.error("Districts error:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// List subdistricts by state and district
app.get(
  "/api/v1/subdistricts/:state/:district",
  verifyApiKey,
  async (req, res) => {
    const { state, district } = req.params;

    try {
      const stateRecord = await prisma.state.findFirst({
        where: { name: { mode: "insensitive", equals: state } },
      });

      if (!stateRecord) {
        return res.status(404).json({ error: `State '${state}' not found` });
      }

      const districtRecord = await prisma.district.findFirst({
        where: {
          stateId: stateRecord.id,
          name: { mode: "insensitive", equals: district },
        },
      });

      if (!districtRecord) {
        return res.status(404).json({
          error: `District '${district}' not found in state '${state}'`,
        });
      }

      const subdistricts = await prisma.subDistrict.findMany({
        where: { districtId: districtRecord.id },
        select: { name: true, code: true },
        orderBy: { name: "asc" },
      });

      res.json(subdistricts);
    } catch (error) {
      console.error("Subdistricts error:", error);
      res.status(500).json({ error: "Failed to fetch subdistricts" });
    }
  }
);

// List villages by state, district, and subdistrict
app.get(
  "/api/v1/villages/:state/:district/:subdistrict",
  verifyApiKey,
  async (req, res) => {
    const { state, district, subdistrict } = req.params;

    try {
      const stateRecord = await prisma.state.findFirst({
        where: { name: { mode: "insensitive", equals: state } },
      });

      if (!stateRecord) {
        return res.status(404).json({ error: `State '${state}' not found` });
      }

      const districtRecord = await prisma.district.findFirst({
        where: {
          stateId: stateRecord.id,
          name: { mode: "insensitive", equals: district },
        },
      });

      if (!districtRecord) {
        return res.status(404).json({ error: `District '${district}' not found` });
      }

      const subdistrictRecord = await prisma.subDistrict.findFirst({
        where: {
          districtId: districtRecord.id,
          name: { mode: "insensitive", equals: subdistrict },
        },
      });

      if (!subdistrictRecord) {
        return res.status(404).json({
          error: `Subdistrict '${subdistrict}' not found`,
        });
      }

      const villages = await prisma.village.findMany({
        where: { subDistrictId: subdistrictRecord.id },
        select: { name: true, code: true },
        orderBy: { name: "asc" },
        take: 10000,
      });

      res.json(villages);
    } catch (error) {
      console.error("Villages error:", error);
      res.status(500).json({ error: "Failed to fetch villages" });
    }
  }
);

// Search villages (full-text search)
app.get("/api/v1/search", verifyApiKey, async (req, res) => {
  const { q, limit = 200 } = req.query;

  if (!q || q.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Search query required: ?q=villageName" });
  }

  try {
    const query = q.trim().toLowerCase();

    const villages = await prisma.village.findMany({
      where: {
        name: { mode: "insensitive", contains: query },
      },
      select: {
        name: true,
        code: true,
        subDistrict: {
          select: {
            name: true,
            district: {
              select: {
                name: true,
                state: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ name: "asc" }],
      take: parseInt(limit),
    });

    // Format response
    const results = villages.map((v) => ({
      village: v.name,
      code: v.code,
      subdistrict: v.subDistrict.name,
      district: v.subDistrict.district.name,
      state: v.subDistrict.district.state.name,
    }));

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── Admin Routes (JWT Required) ───────────────────────────────────────────────

app.get("/api/admin/users", verifyJWT, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        active: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/admin/logs", verifyJWT, async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const logs = await prisma.apiLog.findMany({
      select: {
        id: true,
        endpoint: true,
        method: true,
        statusCode: true,
        responseTime: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    console.error("Logs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ── B2B Routes (JWT Required) ─────────────────────────────────────────────────
const crypto = require('crypto');

app.get('/api/b2b/keys', verifyJWT, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      select: { id: true, key: true, name: true, active: true, createdAt: true, lastUsed: true }
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch keys' });
  }
});

app.post('/api/b2b/keys', verifyJWT, async (req, res) => {
  try {
    const { name = 'My Key' } = req.body;
    const bcrypt = require('bcrypt');

    const keyCount = await prisma.apiKey.count({ 
      where: { userId: req.userId } 
    });
    if (keyCount >= 5) return res.status(400).json({ error: 'Maximum 5 active keys allowed' });

    const key = 'ak_' + crypto.randomBytes(16).toString('hex');
    const secret = 'as_' + crypto.randomBytes(16).toString('hex');
    const secretHash = await bcrypt.hash(secret, 10);

   const apiKey = await prisma.apiKey.create({
      data: { key, secretHash, userId: req.userId }
    });

    res.json({ id: apiKey.id, key, secret, createdAt: apiKey.createdAt });
  } catch (error) {
    console.error('Create key error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Error Handling ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Endpoint '${req.path}' does not exist`,
    docs: "/api/docs",
  });
});

// ── Logging Middleware (for all requests)
app.use(async (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", async () => {
    if (req.apiKey && req.user) {
      const responseTime = Date.now() - startTime;

      try {
        await prisma.apiLog.create({
          data: {
            apiKeyId: req.apiKey.id,
            userId: req.user.id,
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTime,
            userAgent: req.headers["user-agent"] || "",
            ipAddress: req.ip || req.connection.remoteAddress || "",
          },
        });
      } catch (error) {
        console.error("Failed to log API request:", error);
      }
    }
  });

  next();
});

async function start() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n🚀 Bharat Villages API Server v2.0");
      console.log(`📡 Running on port ${PORT}`);
      console.log(`📚 API Docs: /api/docs`);
      console.log(`🔍 Try: /api/v1/states\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});