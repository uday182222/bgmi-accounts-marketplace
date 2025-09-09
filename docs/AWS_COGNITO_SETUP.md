# AWS Cognito Setup Guide

This guide will help you set up AWS Cognito for the BGMI Accounts Service.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI
3. **AWS Permissions**: Ensure your AWS user has permissions to create Cognito resources

## Option 1: Automated Setup (Recommended)

### Step 1: Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

### Step 2: Run the Setup Script

```bash
./scripts/setup-aws-cognito.sh
```

The script will:
- Deploy CloudFormation stack with all Cognito resources
- Create User Pool, App Client, Identity Pool, and IAM roles
- Generate a `.env` file with the correct configuration
- Display all the necessary credentials

## Option 2: Manual Setup via AWS Console

### Step 1: Create Cognito User Pool

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click "Create user pool"
3. Configure the following:

#### Sign-in experience
- **User pool name**: `bgmi-accounts-dev-user-pool`
- **Username**: Check "Email"
- **Cognito user pool sign-in options**: Check "Email"

#### Security requirements
- **Password policy**: 
  - Minimum length: 8
  - Require uppercase: Yes
  - Require lowercase: Yes
  - Require numbers: Yes
  - Require symbols: Yes
- **Multi-factor authentication**: Optional

#### Sign-up experience
- **Self-service sign-up**: Enable
- **Attribute verification and user account confirmation**: Email
- **Required attributes**: Email
- **Custom attributes**: 
  - `role` (String, Mutable)

#### Message delivery
- **Email**: Send email with Cognito

### Step 2: Create App Client

1. In your User Pool, go to "App integration" tab
2. Click "Create app client"
3. Configure:
   - **App type**: Public client
   - **App client name**: `bgmi-accounts-dev-app-client`
   - **Client secret**: Don't generate
   - **Authentication flows**: 
     - ✅ ALLOW_USER_SRP_AUTH
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
   - **OAuth 2.0 grant types**: Authorization code grant
   - **OpenID Connect scopes**: email, openid, profile

### Step 3: Create User Pool Groups

1. Go to "Groups" tab in your User Pool
2. Create three groups:
   - **buyer** (Precedence: 1)
   - **seller** (Precedence: 2)  
   - **admin** (Precedence: 3)

### Step 4: Create Identity Pool

1. Go to [Cognito Identity Pools](https://console.aws.amazon.com/cognito/v2/identity-pools)
2. Click "Create identity pool"
3. Configure:
   - **Identity pool name**: `bgmi-accounts-dev-identity-pool`
   - **Authentication providers**: Cognito
   - **User Pool ID**: Select your created user pool
   - **App client ID**: Select your created app client

### Step 5: Configure IAM Roles

1. In Identity Pool settings, go to "Authentication providers"
2. Edit the authenticated role
3. Add the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-identity:GetId",
                "cognito-identity:GetCredentialsForIdentity"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:GetUser",
                "cognito-idp:UpdateUserAttributes"
            ],
            "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT:userpool/USER_POOL_ID"
        }
    ]
}
```

## Step 6: Update Backend Configuration

Create or update `backend/.env` with your Cognito credentials:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_USER_POOL_CLIENT_ID=your_cognito_client_id
COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
S3_BUCKET_NAME=bgmi-accounts-dev-user-uploads
DYNAMO_TABLE_PREFIX=bgmi-accounts
KMS_KEY_ID=alias/bgmi-accounts-credentials
SES_FROM_EMAIL=noreply@bgmi-accounts.com
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:bgmi-accounts-notifications
```

## Step 7: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test user registration:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "TestPassword123!",
       "confirmPassword": "TestPassword123!",
       "firstName": "Test",
       "lastName": "User",
       "role": "buyer"
     }'
   ```

3. Check AWS Cognito Console to see the created user

## Troubleshooting

### Common Issues

1. **"The security token included in the request is invalid"**
   - Check your AWS credentials in `.env`
   - Ensure your AWS user has proper permissions

2. **"User already exists"**
   - Check if user already exists in Cognito User Pool
   - Try with a different email/username

3. **"Invalid user pool configuration"**
   - Verify User Pool ID and Client ID are correct
   - Check if the app client is configured properly

### Verification Steps

1. **Check User Pool**: Go to Cognito Console > User Pools > Your Pool > Users
2. **Check Groups**: Verify user groups are created
3. **Check App Client**: Ensure authentication flows are enabled
4. **Check IAM Roles**: Verify role permissions are correct

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **IAM Permissions**: Use least privilege principle
3. **Password Policy**: Enforce strong password requirements
4. **MFA**: Consider enabling Multi-Factor Authentication for admin users
5. **Monitoring**: Enable CloudTrail for audit logging

## Next Steps

After successful setup:

1. Update frontend to use Cognito SDK
2. Implement proper error handling
3. Add user verification flows
4. Set up password reset functionality
5. Configure email templates
6. Add user management features

## Support

If you encounter issues:

1. Check AWS CloudFormation stack events
2. Review CloudWatch logs
3. Verify IAM permissions
4. Check Cognito User Pool logs

