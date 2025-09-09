#!/bin/bash

# BGMI Accounts Marketplace - Quick Setup Script
# This script helps you quickly set up the project on a new system

set -e

echo "🎮 BGMI Accounts Marketplace - Quick Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18+
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18+ is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgres() {
    print_status "Checking PostgreSQL installation..."
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL is installed"
    else
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 13+ from https://www.postgresql.org/download/"
        print_status "You can also use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing frontend dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_success "All dependencies installed successfully!"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_USER_POOL_CLIENT_ID=1234567890abcdef
COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bgmi_marketplace

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Encryption Configuration
CREDENTIAL_ENCRYPTION_KEY=your_32_character_encryption_key

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Frontend .env.local
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
EOF
        print_success "Created .env.local file"
    else
        print_warning ".env.local already exists, skipping..."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if command -v createdb &> /dev/null; then
        print_status "Creating database 'bgmi_marketplace'..."
        createdb bgmi_marketplace 2>/dev/null || print_warning "Database might already exist"
        
        print_status "Running database migrations..."
        cd backend
        npm run migrate 2>/dev/null || print_warning "Migrations might have failed - check your database connection"
        cd ..
        
        print_success "Database setup completed!"
    else
        print_warning "PostgreSQL not found. Please set up the database manually:"
        print_status "1. Create database: createdb bgmi_marketplace"
        print_status "2. Run migrations: cd backend && npm run migrate"
    fi
}

# Main setup function
main() {
    echo ""
    print_status "Starting setup process..."
    echo ""
    
    # Check prerequisites
    check_node
    check_postgres
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Create environment files
    create_env_files
    echo ""
    
    # Setup database
    setup_database
    echo ""
    
    # Final instructions
    print_success "Setup completed! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Update environment variables in backend/.env and .env.local"
    echo "2. Set up AWS Cognito, Stripe, and Google OAuth (see scripts/admin-setup-guide.md)"
    echo "3. Start the application:"
    echo "   - Backend: cd backend && npm run dev"
    echo "   - Frontend: npm run dev"
    echo ""
    print_status "For detailed setup instructions, see README.md"
    echo ""
}

# Run main function
main
