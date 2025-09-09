# AWS Deployment Guide for BGMI Marketplace

## 🎯 **Deployment Architecture**

### **Frontend: AWS Amplify**
- **Service**: AWS Amplify Hosting
- **Domain**: Custom domain with SSL
- **CDN**: CloudFront distribution
- **Build**: Next.js static export

### **Backend: AWS ECS with Fargate**
- **Service**: AWS ECS (Elastic Container Service)
- **Compute**: Fargate (serverless containers)
- **Load Balancer**: Application Load Balancer
- **Auto Scaling**: ECS Auto Scaling

### **Database: AWS RDS**
- **Service**: Amazon RDS PostgreSQL
- **Instance**: db.t3.micro (free tier eligible)
- **Backup**: Automated backups
- **Security**: VPC with private subnets

### **Additional Services**
- **SSL**: AWS Certificate Manager
- **Monitoring**: CloudWatch
- **Secrets**: AWS Secrets Manager
- **Storage**: S3 for file uploads

## 📋 **Prerequisites**

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **Domain name** (optional, for custom domain)

## 🚀 **Deployment Steps**

### **Step 1: Frontend Deployment (AWS Amplify)**

1. **Prepare Frontend for Production**
   ```bash
   # Build the frontend
   npm run build
   ```

2. **Deploy to AWS Amplify**
   - Go to AWS Amplify Console
   - Connect GitHub repository
   - Configure build settings
   - Deploy automatically

### **Step 2: Backend Deployment (AWS ECS)**

1. **Create Dockerfile for Backend**
2. **Build and push Docker image to ECR**
3. **Create ECS cluster and service**
4. **Configure Application Load Balancer**

### **Step 3: Database Setup (AWS RDS)**

1. **Create RDS PostgreSQL instance**
2. **Configure VPC and security groups**
3. **Run database migrations**

### **Step 4: Environment Configuration**

1. **Set up AWS Secrets Manager**
2. **Configure environment variables**
3. **Update frontend API endpoints**

## 🔧 **Configuration Files**

The following files will be created:
- `Dockerfile` - Backend container configuration
- `docker-compose.yml` - Local development
- `aws/` - AWS infrastructure as code
- `amplify.yml` - Amplify build configuration

## 📊 **Estimated Costs**

- **AWS Amplify**: $1-5/month
- **ECS Fargate**: $10-20/month
- **RDS PostgreSQL**: $15-25/month
- **Load Balancer**: $16/month
- **Total**: ~$42-66/month

## 🔐 **Security Considerations**

- All services in private VPC
- SSL certificates via ACM
- Secrets managed by AWS Secrets Manager
- IAM roles with least privilege
- Database encryption at rest

## 📈 **Scaling**

- Auto Scaling Groups for ECS
- CloudFront for global CDN
- RDS Read Replicas for database scaling
- S3 for file storage scaling
