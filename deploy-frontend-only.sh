#!/bin/bash

# Frontend-only deployment to AWS Amplify
# This script prepares everything for AWS Amplify deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🚀 Frontend Deployment Preparation for AWS Amplify"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Next.js is installed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Build the frontend
print_status "Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build successful!"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Check if .next directory exists
if [ -d ".next" ]; then
    print_success "Build output directory (.next) created"
else
    print_error "Build output directory not found"
    exit 1
fi

# Create amplify.yml if it doesn't exist
if [ ! -f "amplify.yml" ]; then
    print_status "Creating amplify.yml..."
    cat > amplify.yml << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
EOF
    print_success "amplify.yml created"
fi

# Check git status
print_status "Checking git status..."
if git status --porcelain | grep -q .; then
    print_warning "There are uncommitted changes. Committing them..."
    git add .
    git commit -m "feat: Prepare for AWS Amplify deployment"
    print_success "Changes committed"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main
print_success "Code pushed to GitHub"

echo ""
echo "🎉 Frontend is ready for AWS Amplify deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' → 'Host web app'"
echo "3. Select 'GitHub' as source"
echo "4. Connect your repository: uday182222/bgmi-accounts-marketplace"
echo "5. Use these build settings:"
echo "   - Build command: npm run build"
echo "   - Output directory: .next"
echo "6. Add environment variables:"
echo "   - NEXT_PUBLIC_API_URL: (your backend URL)"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: (your Stripe key)"
echo "   - NEXT_PUBLIC_GOOGLE_CLIENT_ID: (your Google OAuth key)"
echo ""
echo "🔗 Repository: https://github.com/uday182222/bgmi-accounts-marketplace"
echo ""
echo "💡 For backend deployment, you'll need to:"
echo "1. Create ECS cluster in AWS Console"
echo "2. Create RDS PostgreSQL database"
echo "3. Deploy your Docker image to ECS"
echo "4. Configure load balancer and security groups"
