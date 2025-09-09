# Manual AWS Cognito Setup Guide

## Overview
This guide provides step-by-step instructions for manually setting up AWS Cognito for the BGMI Accounts Marketplace.

## Prerequisites
- AWS Account with appropriate permissions
- Access to AWS Console
- Basic understanding of AWS services

## Step 1: Create Cognito User Pool

1. **Navigate to Cognito:**
   - Go to AWS Console
   - Search for "Cognito"
   - Click "Create user pool"

2. **Configure Sign-in Options:**
   - Select "Email" as the primary sign-in method
   - Enable "Allow users to sign in with their email address"
   - Click "Next"

3. **Configure Security Requirements:**
   - Set password policy (minimum 8 characters, mixed case, numbers, symbols)
   - Enable MFA if desired
   - Click "Next"

4. **Configure Sign-up Experience:**
   - Enable "Allow users to sign up"
   - Select "Email" as required attributes
   - Add custom attributes if needed (e.g., username, phone)
   - Click "Next"

5. **Configure Message Delivery:**
   - Select "Send email with Cognito"
   - Configure email settings
   - Click "Next"

6. **Review and Create:**
   - Review all settings
   - Give your user pool a name: "bgmi-marketplace-users"
   - Click "Create user pool"

## Step 2: Create App Client

1. **Add App Client:**
   - In your user pool, go to "App integration" tab
   - Click "Create app client"
   - Select "Public client" (for web applications)
   - Give it a name: "bgmi-marketplace-web"

2. **Configure App Client:**
   - Enable "Generate client secret" (uncheck for public clients)
   - Enable "ALLOW_USER_SRP_AUTH"
   - Enable "ALLOW_REFRESH_TOKEN_AUTH"
   - Click "Create app client"

3. **Note Down Credentials:**
   - Copy the Client ID
   - Copy the Client Secret (if generated)
   - Save these for later use

## Step 3: Configure Identity Providers

1. **Add Google Identity Provider:**
   - Go to "Sign-in experience" tab
   - Click "Add identity provider"
   - Select "Google"
   - Enter Google Client ID and Secret
   - Configure attribute mapping
   - Click "Save"

2. **Configure Attribute Mapping:**
   - Map Google email to Cognito email
   - Map Google name to Cognito name
   - Save changes

## Step 4: Update Backend Configuration

Once you have the credentials, update your `backend/.env` file:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_USER_POOL_CLIENT_ID=1234567890abcdef
COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Step 5: Configure Domain

1. **Set Up Cognito Domain:**
   - Go to "App integration" tab
   - Click "Create Cognito domain"
   - Choose a unique domain name
   - Save the domain

2. **Configure Callback URLs:**
   - Add callback URLs:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Add sign-out URLs:
     - `http://localhost:3000/login` (development)
     - `https://yourdomain.com/login` (production)

## Step 6: Test Configuration

1. **Test User Creation:**
   ```bash
   cd backend
   npm run test:cognito
   ```

2. **Test Authentication:**
   - Try registering a new user
   - Test email verification
   - Test password reset

## Step 7: Production Considerations

1. **Security:**
   - Enable MFA for admin users
   - Set up CloudTrail for audit logging
   - Configure WAF rules if needed

2. **Monitoring:**
   - Set up CloudWatch alarms
   - Monitor authentication metrics
   - Track failed login attempts

3. **Backup:**
   - Export user pool configuration
   - Document all settings
   - Create backup procedures

## Troubleshooting

### Common Issues:

1. **"User does not exist" Error:**
   - Check User Pool ID
   - Verify client ID
   - Ensure user is confirmed

2. **"Invalid client" Error:**
   - Check client ID and secret
   - Verify client configuration
   - Ensure correct region

3. **"Invalid token" Error:**
   - Check JWT configuration
   - Verify token expiration
   - Ensure correct audience

4. **Google OAuth Issues:**
   - Verify Google client ID and secret
   - Check authorized origins
   - Ensure Google+ API is enabled

## Security Best Practices

1. **Environment Variables:**
   - Never commit credentials to version control
   - Use AWS Secrets Manager for production
   - Rotate keys regularly

2. **User Pool Configuration:**
   - Enable advanced security features
   - Set up risk-based authentication
   - Configure account takeover protection

3. **Monitoring:**
   - Enable CloudTrail
   - Set up CloudWatch alarms
   - Monitor for suspicious activity

## Support Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Cognito User Pool Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [AWS Support](https://aws.amazon.com/support/)
