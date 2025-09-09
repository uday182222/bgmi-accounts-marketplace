#!/bin/bash

# AWS Infrastructure Deployment Script for BGMI Accounts Service
# This script deploys the Cognito User Pool and related AWS resources

set -e

# Configuration
STACK_NAME="bgmi-accounts-infrastructure"
TEMPLATE_FILE="infrastructure/cognito-user-pool.yml"
REGION="us-east-1"
ENVIRONMENT="dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "Starting AWS infrastructure deployment..."

# Deploy CloudFormation stack
print_status "Deploying CloudFormation stack: $STACK_NAME"

aws cloudformation deploy \
    --template-file $TEMPLATE_FILE \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

if [ $? -eq 0 ]; then
    print_status "Stack deployed successfully!"
    
    # Get stack outputs
    print_status "Retrieving stack outputs..."
    
    USER_POOL_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
        --output text)
    
    USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
        --output text)
    
    IDENTITY_POOL_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
        --output text)
    
    S3_BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
        --output text)
    
    USER_PROFILES_TABLE=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`UserProfilesTableName`].OutputValue' \
        --output text)
    
    ACCOUNT_LISTINGS_TABLE=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`AccountListingsTableName`].OutputValue' \
        --output text)
    
    # Create .env file with AWS configuration
    print_status "Creating .env file with AWS configuration..."
    
    cat > .env << EOF
# AWS Configuration
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
S3_BUCKET_NAME=$S3_BUCKET_NAME
DYNAMO_TABLE_PREFIX=bgmi-accounts

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
EOF
    
    print_status "Environment configuration saved to .env file"
    
    # Display configuration
    echo ""
    print_status "Deployment completed successfully!"
    echo ""
    echo "Configuration:"
    echo "  User Pool ID: $USER_POOL_ID"
    echo "  User Pool Client ID: $USER_POOL_CLIENT_ID"
    echo "  Identity Pool ID: $IDENTITY_POOL_ID"
    echo "  S3 Bucket: $S3_BUCKET_NAME"
    echo "  User Profiles Table: $USER_PROFILES_TABLE"
    echo "  Account Listings Table: $ACCOUNT_LISTINGS_TABLE"
    echo ""
    print_warning "Please update the .env file with your actual JWT secrets and other sensitive values."
    print_status "You can now start the backend server with: npm run dev"
    
else
    print_error "Stack deployment failed!"
    exit 1
fi
