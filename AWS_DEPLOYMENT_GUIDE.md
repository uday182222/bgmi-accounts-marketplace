# 🚀 BGMI Marketplace - AWS Deployment Guide

## ✅ Current Status
- **Frontend**: ✅ Ready for AWS Amplify deployment
- **Backend Docker Image**: ✅ Built and ready (but ECR push failed due to DNS issues)
- **Repository**: ✅ https://github.com/uday182222/bgmi-accounts-marketplace
- **Infrastructure**: ⚠️ Requires manual setup due to IAM permission limitations

## 🎯 Deployment Options

### Option 1: AWS Amplify (Frontend) - RECOMMENDED
**Easiest and fastest way to get your app live!**

#### Step 1: Deploy Frontend to AWS Amplify
1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Select "GitHub" as source**
4. **Connect your repository**: `uday182222/bgmi-accounts-marketplace`
5. **Use these build settings**:
   ```
   Build command: npm run build
   Output directory: .next
   ```
6. **Add environment variables**:
   - `NEXT_PUBLIC_API_URL`: `http://localhost:5000` (for now)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

#### Step 2: Get Your Frontend URL
- Amplify will provide you with a URL like: `https://main.d1234567890.amplifyapp.com`
- This will be your live frontend!

### Option 2: Backend Deployment (Manual)
**For the backend, you'll need to use AWS Console due to IAM permission limitations.**

#### Step 1: Create ECS Cluster
1. **Go to ECS Console**: https://console.aws.amazon.com/ecs/
2. **Click "Create Cluster"**
3. **Choose "Fargate"**
4. **Name**: `bgmi-marketplace-cluster`
5. **Create cluster**

#### Step 2: Create Task Definition
1. **Go to Task Definitions**
2. **Click "Create new task definition"**
3. **Use these settings**:
   ```
   Task definition family: bgmi-marketplace
   Launch type: Fargate
   CPU: 0.25 vCPU
   Memory: 0.5 GB
   ```
4. **Add container**:
   ```
   Container name: bgmi-backend
   Image URI: 443370697523.dkr.ecr.us-east-1.amazonaws.com/bgmi-marketplace:latest
   Port: 5000
   ```

#### Step 3: Create RDS Database
1. **Go to RDS Console**: https://console.aws.amazon.com/rds/
2. **Click "Create database"**
3. **Choose "PostgreSQL"**
4. **Use these settings**:
   ```
   DB instance identifier: bgmi-marketplace-db
   Master username: postgres
   Master password: [generate strong password]
   DB instance class: db.t3.micro
   Storage: 20 GB
   ```

#### Step 4: Create ECS Service
1. **Go back to ECS Console**
2. **Create service in your cluster**
3. **Use your task definition**
4. **Configure load balancer**

## 🔧 Environment Variables Setup

### Frontend (AWS Amplify)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (ECS Task Definition)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/bgmi_marketplace
AWS_REGION=us-east-1
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AWS_COGNITO_USER_POOL_ID=your-cognito-pool-id
AWS_COGNITO_CLIENT_ID=your-cognito-client-id
AWS_COGNITO_REGION=us-east-1
```

## 🚨 Troubleshooting

### ECR Login Issues
If you're still having ECR login issues, try:
```bash
# Check your AWS region
aws configure get region

# Try different region
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 443370697523.dkr.ecr.us-west-2.amazonaws.com
```

### IAM Permissions
Your current user needs these additional permissions:
- `ecs:*`
- `rds:*`
- `iam:CreateRole`
- `iam:AttachRolePolicy`
- `iam:PassRole`

## 📋 Quick Commands

```bash
# Check deployment status
./quick-deploy.sh

# Deploy frontend only
./deploy-frontend-only.sh

# Simple deployment (what we can do with current permissions)
./simple-deploy.sh
```

## 🎉 Success Checklist

- [ ] Frontend deployed to AWS Amplify
- [ ] Backend deployed to ECS (or alternative)
- [ ] Database created and connected
- [ ] Environment variables configured
- [ ] SSL certificates set up
- [ ] Domain configured (optional)

## 📞 Need Help?

1. **AWS Support**: Use AWS Console for manual deployments
2. **Documentation**: Check AWS documentation for each service
3. **Community**: AWS forums and Stack Overflow

## 🔗 Important Links

- **Repository**: https://github.com/uday182222/bgmi-accounts-marketplace
- **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
- **ECS Console**: https://console.aws.amazon.com/ecs/
- **RDS Console**: https://console.aws.amazon.com/rds/
- **ECR Console**: https://console.aws.amazon.com/ecr/

---

**Next Step**: Start with AWS Amplify deployment - it's the easiest and will get your frontend live quickly!
