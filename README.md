# FireBerg - Forest Fire Early Warning & Affected Area Reporting Dashboard

A real-time forest fire monitoring and incident management system with map visualization, alert tracking, and analytics.

## Tech Stack

### Frontend
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3.4 + shadcn/ui
- React Leaflet + Leaflet MarkerCluster (OpenStreetMap)
- Recharts (analytics)
- Lucide React (icons)

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL/SQLite
- JWT authentication

## Project Structure

```
fireberg/
├── client/          # React frontend application
├── server/          # Express API backend
├── README.md
└── .env.example
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in both `server/` and `client/` directories and configure:

**Server `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/fireberg"
# Or for SQLite:
# DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
```

**Client `.env`:**
```
VITE_API_URL="http://localhost:3001"
```

### 3. Database Setup

```bash
cd server
npx prisma generate
npx prisma db push
npm run seed  # Populate with mock fire zone data
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3001`

## Features

- **Live Map View**: Color-coded fire risk markers with clustering
- **Alert Panel**: Real-time alert list sorted by severity
- **Affected Area Reporting**: Log incidents with location, damage estimates, and status
- **Analytics Dashboard**: Incident trends and severity distribution
- **Zone Management**: CRUD for monitored fire zones
- **Admin Auth**: JWT-based authentication for protected routes

## Design System

The dashboard uses a command-center aesthetic with:

- **Dark theme default** (`#0B0F17` canvas, not pure black)
- **Severity colors** (strictly reserved for alerts):
  - Low: `#22C55E` (green)
  - Medium: `#F59E0B` (amber)
  - High: `#FB923C` (orange)
  - Critical: `#EF4444` (red)
- **Responsive layout**: Tablet (768-1279px) and desktop (≥1280px)
- **Loading states**: Skeletons and empty states for all data views

## API Endpoints

- `POST /api/auth/login` - Admin authentication
- `GET /api/zones` - List all monitored zones
- `GET /api/alerts` - Get active alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge an alert
- `GET /api/reports` - List incident reports
- `POST /api/reports` - Create new report
- `GET /api/analytics` - Get analytics data

## NASA FIRMS Integration

The data ingestion layer is structured to accept NASA FIRMS API data. To enable live satellite feeds:

1. Obtain a NASA FIRMS API key
2. Replace the seed script's mock data generator with FIRMS API calls
3. The frontend data contract remains unchanged

## License

MIT
