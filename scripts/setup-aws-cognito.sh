#!/bin/bash

# AWS Cognito Setup Script for BGMI Accounts Service
# This script helps you set up AWS Cognito resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
PROJECT_NAME="bgmi-accounts"
REGION="us-east-1"
STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}-cognito"

echo -e "${BLUE}🚀 AWS Cognito Setup for BGMI Accounts Service${NC}"
echo "=================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first:${NC}"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run:${NC}"
    echo "   aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI is configured${NC}"

# Get user input
read -p "Enter environment (dev/staging/prod) [default: dev]: " input_env
ENVIRONMENT=${input_env:-dev}

read -p "Enter AWS region [default: us-east-1]: " input_region
REGION=${input_region:-us-east-1}

STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}-cognito"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $REGION"
echo "   Stack Name: $STACK_NAME"
echo ""

# Deploy CloudFormation stack
echo -e "${BLUE}📦 Deploying Cognito resources...${NC}"

aws cloudformation deploy \
    --template-file infrastructure/cognito-stack.yml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        ProjectName=$PROJECT_NAME \
    --region $REGION \
    --capabilities CAPABILITY_NAMED_IAM

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cognito resources deployed successfully!${NC}"
    
    # Get stack outputs
    echo -e "${BLUE}📋 Getting resource information...${NC}"
    
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
    
    echo -e "${GREEN}🎉 Setup Complete! Here are your credentials:${NC}"
    echo "================================================"
    echo "AWS_REGION=$REGION"
    echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
    echo "COGNITO_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID"
    echo "COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
    echo "S3_BUCKET_NAME=$S3_BUCKET_NAME"
    echo "================================================"
    
    # Create .env file for backend
    echo -e "${BLUE}📝 Creating .env file for backend...${NC}"
    
    cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bgmi_accounts
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_this_very_long_and_secure_123456789
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here_make_this_very_long_and_secure_123456789
JWT_REFRESH_EXPIRES_IN=30d

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=$REGION

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
S3_BUCKET_NAME=$S3_BUCKET_NAME
DYNAMO_TABLE_PREFIX=bgmi-accounts
KMS_KEY_ID=alias/bgmi-accounts-credentials
SES_FROM_EMAIL=noreply@bgmi-accounts.com
SNS_TOPIC_ARN=arn:aws:sns:$REGION:123456789012:bgmi-accounts-notifications

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@bgmiaccounts.com
FROM_NAME=BGMI Accounts

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_123456789
EOF
    
    echo -e "${GREEN}✅ .env file created in backend/.env${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "1. Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env"
    echo "2. Update other configuration values as needed"
    echo "3. Restart your backend server to use the new configuration"
    echo ""
    echo -e "${BLUE}🔗 Next steps:${NC}"
    echo "1. Go to AWS Console > Cognito > User Pools"
    echo "2. Find your user pool: $USER_POOL_ID"
    echo "3. Test user creation and authentication"
    echo "4. Update your frontend to use the new Cognito configuration"
    
else
    echo -e "${RED}❌ Failed to deploy Cognito resources${NC}"
    exit 1
fi

