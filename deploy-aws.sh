#!/bin/bash

# BGMI Marketplace AWS Deployment Script
# This script deploys the entire application to AWS

set -e

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

# Configuration
AWS_REGION="us-east-1"
ENVIRONMENT="production"
APP_NAME="bgmi-marketplace"
ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Get AWS Account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_success "AWS Account ID: $AWS_ACCOUNT_ID"
    
    print_success "All prerequisites met!"
}

# Create ECR repository
create_ecr_repository() {
    print_status "Creating ECR repository..."
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names $APP_NAME --region $AWS_REGION &> /dev/null; then
        print_warning "ECR repository already exists"
    else
        aws ecr create-repository --repository-name $APP_NAME --region $AWS_REGION
        print_success "ECR repository created"
    fi
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
    
    # Build image
    docker build -t $APP_NAME:latest .
    
    # Tag image
    docker tag $APP_NAME:latest $ECR_REPOSITORY:latest
    
    # Push image
    docker push $ECR_REPOSITORY:latest
    
    print_success "Docker image pushed to ECR"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying AWS infrastructure..."
    
    # Deploy ECS cluster
    print_status "Deploying ECS cluster..."
    aws cloudformation deploy \
        --template-file aws/ecs-cluster.yml \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --parameter-overrides Environment=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION
    
    # Get VPC and subnet IDs
    VPC_ID=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --query 'Stacks[0].Outputs[?OutputKey==`VPCId`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    PRIVATE_SUBNET_1=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --query 'Stacks[0].Outputs[?OutputKey==`PrivateSubnet1Id`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    PRIVATE_SUBNET_2=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --query 'Stacks[0].Outputs[?OutputKey==`PrivateSubnet2Id`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    # Deploy RDS database
    print_status "Deploying RDS database..."
    aws cloudformation deploy \
        --template-file aws/rds-database.yml \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-rds \
        --parameter-overrides \
            Environment=$ENVIRONMENT \
            VpcId=$VPC_ID \
            PrivateSubnet1Id=$PRIVATE_SUBNET_1 \
            PrivateSubnet2Id=$PRIVATE_SUBNET_2 \
            DBPassword="$(openssl rand -base64 32)" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION
    
    print_success "Infrastructure deployed successfully!"
}

# Update ECS service
update_ecs_service() {
    print_status "Updating ECS service with new image..."
    
    # Get cluster name
    CLUSTER_NAME=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    # Force new deployment
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service ${ENVIRONMENT}-${APP_NAME}-service \
        --force-new-deployment \
        --region $AWS_REGION
    
    print_success "ECS service updated!"
}

# Get deployment URLs
get_deployment_info() {
    print_status "Getting deployment information..."
    
    # Get ALB DNS name
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-ecs \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    # Get database endpoint
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name ${ENVIRONMENT}-${APP_NAME}-rds \
        --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    print_success "Deployment completed!"
    echo ""
    echo "🌐 Backend API URL: http://$ALB_DNS"
    echo "🗄️  Database Endpoint: $DB_ENDPOINT"
    echo ""
    echo "Next steps:"
    echo "1. Deploy frontend to AWS Amplify"
    echo "2. Update frontend API URL to: http://$ALB_DNS"
    echo "3. Configure environment variables in AWS Secrets Manager"
    echo "4. Run database migrations"
}

# Main deployment function
main() {
    echo "🚀 Starting AWS deployment for BGMI Marketplace..."
    echo ""
    
    check_prerequisites
    create_ecr_repository
    build_and_push_image
    deploy_infrastructure
    update_ecs_service
    get_deployment_info
    
    print_success "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"
