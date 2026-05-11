# Bharat Villages - Enterprise Edition v2.0

A modern, enterprise-grade full-stack application for searching and browsing village-level geographical data for all Indian states. Built with PostgreSQL, React, and modern Node.js best practices.

## 🎯 Key Features

✅ **PostgreSQL Database** - Normalized 3NF schema with ~600K villages  
✅ **REST API** - RESTful endpoints with authentication & rate limiting  
✅ **JWT + API Key Auth** - Dual authentication for different use cases  
✅ **React Frontend** - Modern UI with search and hierarchical browsing  
✅ **Admin Dashboard** - User management and usage analytics  
✅ **Request Logging** - Track all API usage for analytics  
✅ **Prisma ORM** - Type-safe database queries & migrations  
✅ **Production Ready** - Error handling, validation, security middleware  

## 🏗️ Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (NeonDB recommended) |
| **ORM** | Prisma |
| **Frontend** | React 18 + Vite |
| **Auth** | JWT + bcrypt |
| **Caching** | Redis (optional) |
| **Hosting** | Vercel or Docker |

## 📦 Project Structure

```
all-india-villages-master-list-excel/
├── backend/                      # Express.js API
│   ├── config/
│   │   ├── db.js                # Database connection
│   │   └── auth.js              # JWT & API key auth
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── scripts/
│   │   ├── migrate.js           # Data migration script
│   │   └── create-user.js       # User creation utility
│   ├── server.js                # Main server file
│   ├── processData.js           # Excel processing
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .gitignore
├── dataset/                      # Excel source files
├── SETUP.md                      # Detailed setup guide
├── README.md                     # This file
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ or [NeonDB account](https://neon.tech)

### Installation

1. **Backend Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npx prisma migrate dev --name init
node scripts/migrate.js        # Import village data
node scripts/create-user.js    # Create first user
npm start
```

2. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
npm start
```

3. **Access Application**
- Frontend: http://localhost:3000
- API Docs: http://127.0.0.1:8000/api/docs

## 📚 API Endpoints

### Public
- `GET /` - Health check
- `GET /api/docs` - API documentation

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login & get JWT token

### Village Data (Requires API Key: `X-API-Key: your-key`)
- `GET /api/v1/stats` - Dataset statistics
- `GET /api/v1/states` - List all states
- `GET /api/v1/districts/:state` - Districts in state
- `GET /api/v1/subdistricts/:state/:district` - Subdistricts
- `GET /api/v1/villages/:state/:district/:subdistrict` - Villages
- `GET /api/v1/search?q=name` - Full-text search

### Admin (Requires JWT: `Authorization: Bearer token`)
- `GET /api/admin/users` - List users
- `GET /api/admin/logs` - View API usage logs

## 🔐 Authentication

### Example: Register & Get API Key
```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecurePass123"
  }'

# Use API Key in requests
curl http://127.0.0.1:8000/api/v1/states \
  -H "X-API-Key: your-api-key"
```

## 🗄️ Database Schema

### Tables
1. **countries** - Country records
2. **states** - States (36 + UTs)
3. **districts** - Districts (~700)
4. **sub_districts** - Blocks/Talukas (~6000)
5. **villages** - Villages (~600K)
6. **users** - User accounts
7. **api_keys** - API credentials
8. **api_logs** - Usage analytics

### Entity Relationships
```
Country
  └─ State
     └─ District
        └─ SubDistrict
           └─ Village

User
  ├─ ApiKey
  └─ ApiLog
```

## 🔧 Development

### Database Management
```bash
# Open Prisma Studio (web UI at :5555)
npm run prisma:studio

# Create migration
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Start Development Servers
```bash
# Terminal 1 - Backend with auto-reload
cd backend && npm run dev

# Terminal 2 - Frontend with hot-reload
cd frontend && npm start
```

## 🚢 Production Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="your-long-random-secret-key"
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX_REQUESTS=1000
```

### Vercel Deploy
```bash
vercel link
vercel env add DATABASE_URL <your-db-url>
vercel deploy
```

### Docker
```bash
docker build -t bharat-villages .
docker run -p 8000:8000 bharat-villages
```

## 📊 Dataset

Source: Ministry of Drinking Water & Sanitation (MDDS)

**Coverage:**
- 36 States + Union Territories
- 700+ Districts  
- 6,000+ Sub-Districts
- 600,000+ Villages

## 🔧 Troubleshooting

**"DATABASE_URL not set"**
- Create `.env` in `backend/` with your database connection

**"Cannot connect to database"**
- Verify PostgreSQL is running
- Check connection string format

**"npm: command not found"**
- Restart terminal after installing Node.js

**"Prisma migration failed"**
- Run `npx prisma migrate reset` to reset and retry

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 📖 Additional Resources

- [Complete Setup Guide](./SETUP.md)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Guide](https://expressjs.com/)
- [NeonDB Setup](https://neon.tech/docs/get-started-with-neon/signing-up)

## 📝 License

ISC

---

**Built with ❤️ for exploring Indian villages 🇮🇳**

**Version:** 2.0.0 (Enterprise Edition)  
**Last Updated:** April 2026
