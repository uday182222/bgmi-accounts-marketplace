#!/bin/bash

# Quick AWS Deployment Script for BGMI Marketplace
# This script provides a simplified deployment process

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 BGMI Marketplace - Quick AWS Deployment${NC}"
echo "=============================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS CLI not configured. Please run 'aws configure' first.${NC}"
    echo ""
    echo "To configure AWS CLI:"
    echo "1. Get your AWS Access Key ID and Secret Access Key"
    echo "2. Run: aws configure"
    echo "3. Enter your credentials and region (us-east-1 recommended)"
    exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo ""

# Option 1: Deploy Backend Only
echo "Choose deployment option:"
echo "1. Deploy Backend Only (ECS + RDS)"
echo "2. Deploy Frontend Only (Amplify)"
echo "3. Deploy Everything"
echo "4. Show deployment URLs"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}Deploying Backend to AWS...${NC}"
        ./deploy-aws.sh
        ;;
    2)
        echo -e "${BLUE}Frontend deployment instructions:${NC}"
        echo ""
        echo "1. Go to AWS Amplify Console"
        echo "2. Click 'New app' → 'Host web app'"
        echo "3. Connect your GitHub repository"
        echo "4. Use these build settings:"
        echo "   - Build command: npm run build"
        echo "   - Output directory: out"
        echo "5. Add environment variables:"
        echo "   - NEXT_PUBLIC_API_URL: (your backend URL)"
        echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: (your Stripe key)"
        echo "   - NEXT_PUBLIC_GOOGLE_CLIENT_ID: (your Google OAuth key)"
        ;;
    3)
        echo -e "${BLUE}Deploying Everything...${NC}"
        ./deploy-aws.sh
        echo ""
        echo -e "${YELLOW}Next: Deploy frontend to AWS Amplify${NC}"
        echo "1. Go to AWS Amplify Console"
        echo "2. Connect your GitHub repository"
        echo "3. Use the build settings from option 2"
        ;;
    4)
        echo -e "${BLUE}Getting deployment information...${NC}"
        # Get ALB DNS name
        ALB_DNS=$(aws cloudformation describe-stacks \
            --stack-name production-bgmi-marketplace-ecs \
            --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
            --output text \
            --region us-east-1 2>/dev/null || echo "Not deployed")
        
        if [ "$ALB_DNS" != "Not deployed" ]; then
            echo -e "${GREEN}Backend API URL: http://$ALB_DNS${NC}"
        else
            echo -e "${YELLOW}Backend not deployed yet${NC}"
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
