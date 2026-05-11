/**
 * Authentication middleware and utilities
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { prisma } = require("./db");

// Generate JWT token
function generateToken(userId, expiresIn = "7d") {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
    expiresIn,
  });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch (error) {
    return null;
  }
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Middleware: Verify API Key
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!key || !key.active || !key.user.active) {
      return res.status(401).json({ error: "Invalid or inactive API key" });
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    });

    // Attach to request
    req.apiKey = key;
    req.user = key.user;

    next();
  } catch (error) {
    console.error("API key verification error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Middleware: Verify JWT (for admin routes)
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = decoded.userId;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  verifyApiKey,
  verifyJWT,
};
