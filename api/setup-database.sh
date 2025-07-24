#!/bin/bash

# TalentLink Database Setup Script
# This script sets up the PostgreSQL database and tables for the TalentLink project

echo "🚀 Starting TalentLink Database Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_info "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is installed"
        return 0
    elif command -v postgres &> /dev/null; then
        print_status "PostgreSQL is installed"
        return 0
    else
        print_error "PostgreSQL is not installed!"
        echo
        echo "Please install PostgreSQL first:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        echo "  Windows: Download from https://www.postgresql.org/download/windows/"
        echo
        exit 1
    fi
}

# Check if PostgreSQL service is running
check_postgresql_service() {
    print_info "Checking PostgreSQL service..."
    
    if pgrep -x "postgres" > /dev/null; then
        print_status "PostgreSQL service is running"
        return 0
    else
        print_warning "PostgreSQL service is not running"
        echo
        echo "Starting PostgreSQL service..."
        
        # Try different methods to start PostgreSQL
        if command -v brew &> /dev/null; then
            # macOS with Homebrew
            brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
        elif command -v systemctl &> /dev/null; then
            # Linux with systemd
            sudo systemctl start postgresql
        elif command -v service &> /dev/null; then
            # Linux with service
            sudo service postgresql start
        else
            print_error "Could not start PostgreSQL automatically"
            echo "Please start PostgreSQL manually and run this script again"
            exit 1
        fi
        
        sleep 2
        
        if pgrep -x "postgres" > /dev/null; then
            print_status "PostgreSQL service started successfully"
        else
            print_error "Failed to start PostgreSQL service"
            exit 1
        fi
    fi
}

# Get database configuration
get_db_config() {
    print_info "Reading database configuration..."
    
    if [ -f ".env" ]; then
        source .env
        print_status "Database configuration loaded from .env file"
        
        DB_USER=${DB_USER:-postgres}
        DB_PASSWORD=${DB_PASSWORD:-admin}
        DB_NAME=${DB_NAME:-talentlink}
        DB_HOST=${DB_HOST:-localhost}
        DB_PORT=${DB_PORT:-5432}
        
    else
        print_warning ".env file not found, using default configuration"
        
        # Use default values
        DB_USER="postgres"
        DB_PASSWORD="admin"
        DB_NAME="talentlink"
        DB_HOST="localhost"
        DB_PORT="5432"
        
        # Create .env file with default values
        create_env_file
    fi
    
    echo
    echo "Database Configuration:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo
}

# Create .env file with database configuration
create_env_file() {
    print_info "Creating .env file with default configuration..."
    
    cat > .env << EOF
# PostgreSQL Database Configuration
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Stripe Secret Key (Add your own key)
STRIPE=your_stripe_secret_key_here

# JWT Secret Key
JWT_KEY=a4yF7eO7J4CQkKMgbojpjoJ16ahHZn3A

# Development Environment
NODE_ENV=development

# Server Configuration
PORT=8800
CORS_ORIGIN=http://localhost:5173
EOF
    
    print_status ".env file created with default configuration"
}

# Test database connection
test_db_connection() {
    print_info "Testing database connection..."
    
    # Try to connect to PostgreSQL server
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT version();" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_status "Successfully connected to PostgreSQL server"
        return 0
    else
        print_error "Cannot connect to PostgreSQL server"
        echo
        echo "Please check:"
        echo "  1. PostgreSQL is running"
        echo "  2. Username and password are correct"
        echo "  3. PostgreSQL is configured to accept connections"
        echo
        echo "You may need to create the PostgreSQL user:"
        echo "  sudo -u postgres createuser --interactive $DB_USER"
        echo "  sudo -u postgres psql -c \"ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';\""
        echo
        exit 1
    fi
}

# Create database if it doesn't exist
create_database() {
    print_info "Creating database '$DB_NAME'..."
    
    # Check if database exists
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        print_warning "Database '$DB_NAME' already exists"
    else
        # Create the database
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_status "Database '$DB_NAME' created successfully"
        else
            print_error "Failed to create database '$DB_NAME'"
            exit 1
        fi
    fi
}

# Install npm dependencies
install_dependencies() {
    print_info "Installing npm dependencies..."
    
    if [ -f "package.json" ]; then
        npm install > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_status "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_error "package.json not found!"
        exit 1
    fi
}

# Run database setup using Node.js
setup_database_tables() {
    print_info "Setting up database tables..."
    
    # Create a temporary setup script
    cat > temp_db_setup.js << 'EOF'
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function setupTables() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');

    // Create all tables
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        img VARCHAR(255),
        country VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        "desc" TEXT,
        "isSeller" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created/verified');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS gigs (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        "desc" TEXT NOT NULL,
        "totalStars" INTEGER DEFAULT 0,
        "starNumber" INTEGER DEFAULT 0,
        cat VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        cover VARCHAR(255) NOT NULL,
        images TEXT,
        "shortTitle" VARCHAR(255) NOT NULL,
        "shortDesc" VARCHAR(255) NOT NULL,
        "deliveryTime" INTEGER NOT NULL,
        "revisionNumber" INTEGER NOT NULL,
        features TEXT,
        sales INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Gigs table created/verified');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        "sellerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "buyerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "readBySeller" BOOLEAN DEFAULT false,
        "readByBuyer" BOOLEAN DEFAULT false,
        "lastMessage" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Conversations table created/verified');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        "gigId" INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
        img VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        "sellerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "buyerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "isCompleted" BOOLEAN DEFAULT false,
        payment_intent VARCHAR(255) UNIQUE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Orders table created/verified');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        "conversationId" VARCHAR(255) REFERENCES conversations(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "desc" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Messages table created/verified');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        "gigId" INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        star INTEGER NOT NULL CHECK (star >= 1 AND star <= 5),
        "desc" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Reviews table created/verified');

    console.log('✓ All database tables have been set up successfully!');

  } catch (error) {
    console.error('✗ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupTables();
EOF

    # Run the setup script
    node temp_db_setup.js
    
    if [ $? -eq 0 ]; then
        print_status "Database tables set up successfully"
        rm temp_db_setup.js
    else
        print_error "Failed to set up database tables"
        rm temp_db_setup.js
        exit 1
    fi
}

# Test the setup
test_setup() {
    print_info "Testing the setup..."
    
    cat > temp_test_setup.js << 'EOF'
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function testSetup() {
  try {
    await sequelize.authenticate();
    
    // Check if all tables exist
    const tables = ['users', 'gigs', 'conversations', 'orders', 'messages', 'reviews'];
    
    for (const table of tables) {
      const result = await sequelize.query(`SELECT to_regclass('public.${table}')`);
      if (result[0][0].to_regclass === null) {
        throw new Error(`Table ${table} does not exist`);
      }
    }
    
    console.log('✓ All database tables are present and accessible');
    console.log('✓ Setup test completed successfully');
    
  } catch (error) {
    console.error('✗ Setup test failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testSetup();
EOF

    node temp_test_setup.js
    
    if [ $? -eq 0 ]; then
        print_status "Setup test passed"
        rm temp_test_setup.js
    else
        print_error "Setup test failed"
        rm temp_test_setup.js
        exit 1
    fi
}

# Main execution
main() {
    echo "======================================"
    echo "   TalentLink Database Setup Script   "
    echo "======================================"
    echo
    
    check_postgresql
    check_postgresql_service
    get_db_config
    test_db_connection
    create_database
    install_dependencies
    setup_database_tables
    test_setup
    
    echo
    echo "======================================"
    print_status "Database setup completed successfully!"
    echo "======================================"
    echo
    echo "You can now start the application with:"
    echo "  npm start"
    echo
    echo "Database Information:"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  Tables: users, gigs, orders, conversations, messages, reviews"
    echo
}

# Run the main function
main
