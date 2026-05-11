# Bharat Villages - React + Node.js

A modern full-stack application for searching and browsing village-level geographical data for all Indian states.

## Project Structure

```
├── backend/              # Node.js/Express API server
│   ├── server.js         # Main Express server
│   ├── processData.js    # Data processing script
│   └── package.json
├── frontend/             # React application
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API service
│   │   ├── styles/       # CSS files
│   │   └── App.js
│   └── package.json
├── dataset/              # Excel data files (input)
└── data/                 # Generated JSON files (output)
```

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- Excel files in `/dataset` folder

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Step 1: Process Data (First time only)

Generate JSON files from Excel data:

```bash
cd backend
npm run process
```

This creates:
- `data/villages.json` - Hierarchical village structure
- `data/flatIndex.json` - Flat search index
- `data/stats.json` - Dataset statistics

### Step 2: Start Backend Server

```bash
cd backend
npm start
```

Server runs on: `http://127.0.0.1:8000`

API Docs: `http://127.0.0.1:8000/api`

### Step 3: Start React Frontend (in a new terminal)

```bash
cd frontend
npm start
```

Frontend opens on: `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api` | GET | API documentation |
| `/stats` | GET | Dataset statistics |
| `/states` | GET | List all states |
| `/districts/:state` | GET | Districts in a state |
| `/subdistricts/:state/:district` | GET | Subdistricts in a district |
| `/villages/:state/:district/:subdistrict` | GET | Villages in a subdistrict |
| `/search?q=query` | GET | Search villages by name |

## Features

✅ **Search**: Full-text search across all villages  
✅ **Browse**: Hierarchical browsing (State → District → Subdistrict → Villages)  
✅ **Fast API**: RESTful backend with CORS support  
✅ **Modern UI**: React frontend with responsive design  
✅ **Data Processing**: Automated Excel to JSON conversion  

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon (auto-reload)
```

### Frontend Development

```bash
cd frontend
npm start   # Starts with hot-reload
```

## Building for Production

### Backend

Backend is ready as-is. Run with:

```bash
node backend/server.js
```

### Frontend

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/build/`

## Troubleshooting

**Error: "Cannot find module 'express'"**
- Run `npm install` in the backend folder

**Error: "Cannot find module 'react'"**
- Run `npm install` in the frontend folder

**Error: "No data found"**
- Ensure Excel files are in `/dataset` folder
- Run `npm run process` in backend to generate data files

**CORS Error**
- Backend is configured with `cors: "*"`
- Ensure backend is running on port 8000

## Technologies

- **Backend**: Node.js, Express.js, XLSX
- **Frontend**: React, Axios
- **Styling**: CSS3 with responsive design
- **Data**: Excel to JSON pipeline

## License

ISC

---

Built with ❤️ for exploring Indian villages 🇮🇳
