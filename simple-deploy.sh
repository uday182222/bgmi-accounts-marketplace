#!/bin/bash

# Simple AWS Deployment Script for BGMI Marketplace
# This script deploys what we can with current permissions

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

# Configuration
AWS_REGION="us-east-1"
ENVIRONMENT="production"
APP_NAME="bgmi-marketplace"

echo "🚀 Simple AWS Deployment for BGMI Marketplace"
echo "=============================================="

# Check AWS credentials
print_status "Checking AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_success "AWS Account ID: $AWS_ACCOUNT_ID"

# Check if ECR repository exists
print_status "Checking ECR repository..."
if aws ecr describe-repositories --repository-names $APP_NAME --region $AWS_REGION &> /dev/null; then
    print_success "ECR repository exists"
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
    echo "ECR URI: $ECR_URI"
else
    print_warning "ECR repository does not exist"
    print_status "Creating ECR repository..."
    aws ecr create-repository --repository-name $APP_NAME --region $AWS_REGION
    print_success "ECR repository created"
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
fi

# Try to login to ECR
print_status "Logging into ECR..."
if aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI; then
    print_success "ECR login successful"
    
    # Build and push Docker image
    print_status "Building Docker image..."
    docker build -t $APP_NAME:latest .
    
    print_status "Tagging image..."
    docker tag $APP_NAME:latest $ECR_URI:latest
    
    print_status "Pushing image to ECR..."
    docker push $ECR_URI:latest
    
    print_success "Docker image pushed successfully!"
    echo "Image URI: $ECR_URI:latest"
else
    print_error "ECR login failed"
    print_warning "You may need to check your AWS permissions or network connectivity"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Deploy frontend to AWS Amplify (recommended)"
echo "2. Create ECS cluster manually in AWS Console"
echo "3. Create RDS PostgreSQL database manually"
echo "4. Configure environment variables"
echo ""
echo "📋 Manual Deployment Guide:"
echo "1. Go to AWS Amplify Console"
echo "2. Connect your GitHub repository: uday182222/bgmi-accounts-marketplace"
echo "3. Use build settings: npm run build, output: .next"
echo "4. Add environment variables for your API keys"
echo ""
echo "🔗 Repository: https://github.com/uday182222/bgmi-accounts-marketplace"
