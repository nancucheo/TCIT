# Development Guide — TCIT Posts Manager

This guide provides step-by-step instructions for setting up the development environment and running the TCIT Posts Manager application.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v20 or higher)
- **npm** (v10 or higher)
- **Docker** and **Docker Compose**
- **Git**

## Quick Start (Docker Compose)

The fastest way to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd tcit-posts-manager

# Start all services (backend, frontend, database)
docker compose up

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v1
# PostgreSQL: localhost:5432
```

## Manual Setup

### 1. Database Setup (PostgreSQL with Docker)

```bash
# Start only the PostgreSQL container
docker compose up -d db

# Verify the database is running
docker compose ps
```

The PostgreSQL database will be available at:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `tcit_posts`
- **Username**: `tcit_user`
- **Password**: `tcit_password`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the development server
npm run dev
```

**Backend Environment** (`backend/.env`):
```env
DATABASE_URL="postgresql://tcit_user:tcit_password@localhost:5432/tcit_posts"
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:5173
```

The backend API will be available at `http://localhost:3000/api/v1`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the development server
npm run dev
```

**Frontend Environment** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

The frontend application will be available at `http://localhost:5173`

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (target: 90%)
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run unit tests (Vitest)
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Open Playwright interactive UI
npm run test:e2e:ui

# Run E2E tests in headed browser
npm run test:e2e:headed
```

## Prisma Commands

```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Reset database (drops all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## Docker Commands

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild after changes
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (reset DB)
docker compose down -v

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Code Quality

```bash
# Lint (from root or specific workspace)
npm run lint

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## API Endpoints

| Method | Path                | Description        |
|--------|--------------------|--------------------|
| GET    | /api/v1/health     | Health check       |
| GET    | /api/v1/posts      | List all posts     |
| POST   | /api/v1/posts      | Create a new post  |
| DELETE | /api/v1/posts/:id  | Delete a post      |

Full API specification: `docs/openapi.yaml`

## Troubleshooting

### Database connection errors
```bash
# Ensure PostgreSQL is running
docker compose ps

# Check database logs
docker compose logs db

# Reset database if corrupted
docker compose down -v && docker compose up -d db
npx prisma migrate dev
```

### Port conflicts
- Backend default: 3000 (change via `PORT` env var)
- Frontend default: 5173 (change via Vite config)
- PostgreSQL default: 5432 (change via Docker Compose)

### Prisma client out of date
```bash
cd backend && npx prisma generate
```
