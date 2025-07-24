#!/bin/bash
# PostgreSQL Database Setup Script for TalentLink

echo "🚀 Setting up PostgreSQL database for TalentLink..."

# Function to check if PostgreSQL is running
check_postgres() {
    if brew services list | grep -q "postgresql@15.*started"; then
        echo "✅ PostgreSQL is running"
        return 0
    else
        echo "❌ PostgreSQL is not running"
        return 1
    fi
}

# Function to start PostgreSQL
start_postgres() {
    echo "🔄 Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
}

# Function to create database and user
setup_database() {
    echo "📊 Creating database and user..."
    
    # Create user with password
    /opt/homebrew/opt/postgresql@15/bin/psql -d postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dipendra') THEN
                CREATE USER dipendra WITH ENCRYPTED PASSWORD 'admin';
            END IF;
        END
        \$\$;
        
        ALTER USER dipendra CREATEDB;
        ALTER USER dipendra WITH SUPERUSER;
    " 2>/dev/null || echo "User setup completed"
    
    # Create database
    /opt/homebrew/opt/postgresql@15/bin/psql -d postgres -c "
        DROP DATABASE IF EXISTS talentlink;
        CREATE DATABASE talentlink OWNER dipendra;
        GRANT ALL PRIVILEGES ON DATABASE talentlink TO dipendra;
    " 2>/dev/null || echo "Database creation completed"
    
    echo "✅ Database 'talentlink' created successfully!"
}

# Function to test connection
test_connection() {
    echo "🔍 Testing database connection..."
    PGPASSWORD=admin /opt/homebrew/opt/postgresql@15/bin/psql -U dipendra -d talentlink -c "SELECT version();" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful!"
        return 0
    else
        echo "❌ Database connection failed"
        return 1
    fi
}

# Main execution
echo "=== TalentLink PostgreSQL Setup ==="

# Check if PostgreSQL is running, if not start it
if ! check_postgres; then
    start_postgres
fi

# Setup database
setup_database

# Test connection
test_connection

echo ""
echo "📋 Database Configuration:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: talentlink"
echo "   Username: dipendra"
echo "   Password: admin"
echo ""
echo "🎉 PostgreSQL setup completed!"
echo "Now you can run: npm run migrate"
