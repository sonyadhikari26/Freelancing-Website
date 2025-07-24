# TalentLink - Freelance Marketplace Platform

A full-stack freelance marketplace application built with React, Node.js, Express, and PostgreSQL. Perfect for college project demonstration.

## 🚀 Features

- User Authentication (Register/Login)
- Create and browse freelance services (Gigs)
- Order management system
- User profiles (Buyers & Sellers)
- Search and filter functionality
- Responsive design

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, SASS  
**Backend:** Node.js, Express, PostgreSQL, Sequelize ORM  
**Authentication:** JWT with cookies

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd Project-II-TalentLink
```

### 2. Automatic Database Setup
```bash
cd api
node setup-database.js
```
This will:
- Check PostgreSQL installation
- Create database and tables
- Install dependencies
- Create .env configuration

### 3. Start the Application

**Backend:**
```bash
cd api
npm start
```
Server: http://localhost:8800

**Frontend (new terminal):**
```bash
cd client
npm install
npm run dev  
```
Frontend: http://localhost:5173

## 🔧 Manual Setup (if needed)

### Database Setup:
```bash
# Create database
createdb talentlink

# Create .env file in api folder:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=talentlink
DB_USER=postgres
DB_PASSWORD=admin
JWT_KEY=your_secret_key
PORT=8800
```

### Install Dependencies:
```bash
# Backend
cd api && npm install

# Frontend  
cd client && npm install
```

## 🧪 Testing

**Test API:**
```bash
# Register user
curl -X POST http://localhost:8800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123","country":"US"}'

# Get gigs
curl http://localhost:8800/api/gigs
```

## � Project Structure

```
Project-II-TalentLink/
├── api/                    # Backend
│   ├── controllers/        # API logic
│   ├── models/            # Database models  
│   ├── routes/            # API routes
│   ├── setup-database.js  # Auto setup script
│   └── server.js          # Server entry
├── client/                # Frontend
│   ├── src/components/    # React components
│   ├── src/pages/         # Page components
│   └── src/utils/         # API utilities
└── README.md
```

## � Key URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8800/api
- Database: PostgreSQL on localhost:5432

## 🚧 Troubleshooting

**PostgreSQL not found?**
```bash
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
```

**Port already in use?**
```bash
lsof -i :8800  # Find process
kill -9 <PID>  # Kill process
```

**Database connection failed?**
```bash
# Test connection
cd api && npm run test:db
```

## 📝 Available Scripts

**Backend (api folder):**
```bash
npm start        # Start server
npm run setup    # Setup database
npm run test:db  # Test DB connection
```

**Frontend (client folder):**
```bash
npm run dev      # Start development server
npm run build    # Build for production
```

---

This is a complete full-stack application perfect for college project demonstration!
