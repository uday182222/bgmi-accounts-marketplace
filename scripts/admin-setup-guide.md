# Admin Setup Guide

## Overview
This guide will help you set up the BGMI Accounts Marketplace admin panel and configure all necessary services.

## Prerequisites
- Node.js 18+ installed
- AWS Account with appropriate permissions
- Stripe Account for payment processing
- Google Cloud Console account for OAuth

## Step 1: Environment Setup

### Backend Environment Variables
Create a `backend/.env` file with the following variables:

```env
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
```

### Frontend Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Step 2: AWS Cognito Setup

1. **Create User Pool:**
   - Go to AWS Cognito Console
   - Create a new User Pool
   - Configure sign-in options (email, Google)
   - Set up password policy
   - Create app client

2. **Configure Google OAuth:**
   - Add Google as an identity provider
   - Configure OAuth scopes
   - Set up attribute mapping

## Step 3: Database Setup

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE bgmi_marketplace;
   CREATE USER bgmi_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE bgmi_marketplace TO bgmi_user;
   ```

3. **Run Migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

## Step 4: Stripe Setup

1. **Create Stripe Account:**
   - Sign up at https://stripe.com
   - Get your API keys from the dashboard
   - Set up webhooks for payment events

2. **Configure Webhooks:**
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Step 5: Google OAuth Setup

1. **Create Google Cloud Project:**
   - Go to Google Cloud Console
   - Create new project
   - Enable Google+ API

2. **Create OAuth Credentials:**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized origins: `http://localhost:3000`, `https://yourdomain.com`

## Step 6: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## Step 7: Start the Application

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
npm run dev
```

## Step 8: Admin Access

1. **Create Admin User:**
   - Register through the signup page
   - Manually promote user to admin in database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

2. **Access Admin Panel:**
   - Navigate to `/admin`
   - Login with admin credentials
   - Configure platform settings

## Security Considerations

- Never commit `.env` files to version control
- Use strong, unique passwords
- Enable MFA on all accounts
- Regularly rotate API keys
- Monitor access logs

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check PostgreSQL is running
   - Verify connection string
   - Ensure database exists

2. **Cognito Authentication Failed:**
   - Verify AWS credentials
   - Check User Pool configuration
   - Ensure client ID is correct

3. **Stripe Payment Failed:**
   - Verify API keys
   - Check webhook configuration
   - Ensure test mode is enabled for development

4. **Google OAuth Failed:**
   - Verify client ID and secret
   - Check authorized origins
   - Ensure Google+ API is enabled

## Support

For additional help, refer to:
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Stripe Documentation](https://stripe.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Documentation](https://nextjs.org/docs)
