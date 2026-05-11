# Bharat Villages - Enterprise Setup Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v16+ (https://nodejs.org/)
- **PostgreSQL** v12+ (or use a managed service like NeonDB)
- **npm** (comes with Node.js)

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Restart your terminal/PowerShell
4. Verify: `node --version` and `npm --version`

### Step 2: Setup Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL from https://www.postgresql.org/download/
# Create a new database
createdb bharat_villages
```

**Option B: NeonDB (Recommended for Cloud)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string

### Step 3: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
# For local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/bharat_villages"

# For NeonDB (replace with your actual connection string)
DATABASE_URL="postgresql://user:password@region.neon.tech/bharat_villages?sslmode=require"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-key-change-this"

NODE_ENV="development"
PORT=8000
HOST="127.0.0.1"
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Setup Database Schema

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma client
- Set up indexes and foreign keys

### Step 6: Migrate Data from Excel

```bash
node scripts/migrate.js
```

This will:
- Read all Excel files from `../dataset/` folder
- Create Country (India), States, Districts, SubDistricts, and Villages
- Set up all hierarchical relationships

### Step 7: Create First User & API Key

```bash
# Interactive user creation
node scripts/create-user.js
```

Or use the API:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "SecurePassword123"
  }'
```

### Step 8: Start Backend Server

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Server runs on: `http://127.0.0.1:8000`

### Step 9: Start Frontend (in new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend opens on: `http://localhost:3000`

---

## 📚 API Documentation

### Public Endpoints

**Health Check**
```
GET /
```

**API Documentation**
```
GET /api/docs
```

### Authentication

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "password": "Password123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Protected API Routes (Require API Key)

Add header: `X-API-Key: your-api-key`

**Get Statistics**
```bash
GET /api/v1/stats
X-API-Key: your-api-key
```

**List States**
```bash
GET /api/v1/states
X-API-Key: your-api-key
```

**List Districts**
```bash
GET /api/v1/districts/Maharashtra
X-API-Key: your-api-key
```

**List Subdistricts**
```bash
GET /api/v1/subdistricts/Maharashtra/Nandurbar
X-API-Key: your-api-key
```

**List Villages**
```bash
GET /api/v1/villages/Maharashtra/Nandurbar/Akkalkuwa
X-API-Key: your-api-key
```

**Search Villages**
```bash
GET /api/v1/search?q=Manibeli&limit=50
X-API-Key: your-api-key
```

### Admin Routes (Require JWT Token)

Add header: `Authorization: Bearer your-jwt-token`

**List Users**
```bash
GET /api/admin/users
Authorization: Bearer your-jwt-token
```

**View Logs**
```bash
GET /api/admin/logs?limit=100&offset=0
Authorization: Bearer your-jwt-token
```

---

## 🗄️ Database Schema

### Tables

1. **countries** - Root level (India)
2. **states** - 36 states + UTs
3. **districts** - ~700 districts
4. **sub_districts** - ~6,000 blocks/talukas
5. **villages** - ~600,000 villages
6. **users** - B2B client accounts
7. **api_keys** - API credentials
8. **user_state_access** - Access control
9. **api_logs** - Usage tracking

### Relationships

```
Country
  ├── States
  │   ├── Districts
  │   │   └── SubDistricts
  │   │       └── Villages
  │   └── Users (access control)
  └── Users
      ├── ApiKeys
      └── ApiLogs
```

---

## 🔧 Common Operations

### View Database (Prisma Studio)
```bash
npm run prisma:studio
```
Opens web UI at `http://localhost:5555`

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Check Database Migrations
```bash
npm run prisma:migrate
```

### View Current Logs
```bash
# See last 100 API requests
curl http://127.0.0.1:8000/api/admin/logs \
  -H "Authorization: Bearer your-jwt-token"
```

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL not set"
- Create `.env` file in `backend/` folder
- Add `DATABASE_URL` with your PostgreSQL connection string

### Error: "ECONNREFUSED" (Cannot connect to database)
- Make sure PostgreSQL is running
- Verify CONNECTION_URL is correct
- Check firewall/network settings

### Error: "npm: command not found"
- Node.js not installed or not in PATH
- Restart terminal after installing Node.js
- Check: `node --version` and `npm --version`

### Error: "Prisma migration failed"
- Delete existing migrations (if starting fresh)
- Run: `npx prisma migrate reset`
- Confirm data reset

### Data not showing up
- Make sure data migration completed: `node scripts/migrate.js`
- Check Excel files are in `../dataset/` folder
- Verify data integrity: `npm run prisma:studio`

---

## 📦 Production Deployment

### Using Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Automatic deployments on push

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
CMD ["node", "server.js"]
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="very-long-random-string-min-32-chars"
NODE_ENV="production"
PORT=3000
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=3600000
```

---

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [NeonDB Setup](https://neon.tech/docs/get-started-with-neon/signing-up)

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Prisma studio for data integrity
3. Check API logs for errors
4. Enable debug logging: `LOG_LEVEL=debug`

---

**Built with ❤️ for exploring Indian villages 🇮🇳**
