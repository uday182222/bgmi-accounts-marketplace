#!/usr/bin/env node

// Test script to verify Cognito integration
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testCognitoConnection() {
  try {
    console.log('🧪 Testing AWS Cognito Connection...');
    console.log('=====================================');
    
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
    
    if (!userPoolId || !clientId) {
      console.error('❌ Missing Cognito configuration in .env file');
      console.log('Please run: ./scripts/setup-aws-cognito.sh');
      process.exit(1);
    }
    
    console.log(`📋 User Pool ID: ${userPoolId}`);
    console.log(`📋 Client ID: ${clientId}`);
    console.log(`📋 Region: ${process.env.AWS_REGION}`);
    console.log('');
    
    // Test creating a user
    const testEmail = `test-${Date.now()}@example.com`;
    const testUsername = testEmail; // Use email as username
    
    console.log('👤 Creating test user...');
    
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: testUsername,
      UserAttributes: [
        { Name: 'email', Value: testEmail },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'given_name', Value: 'Test' },
        { Name: 'family_name', Value: 'User' },
        { Name: 'custom:role', Value: 'buyer' },
      ],
      TemporaryPassword: 'TempPass123!',
      MessageAction: 'SUPPRESS',
    });
    
    const createResult = await client.send(createUserCommand);
    console.log('✅ User created successfully');
    console.log(`   Username: ${createResult.User?.Username}`);
    console.log(`   Email: ${testEmail}`);
    
    // Set permanent password
    console.log('🔐 Setting permanent password...');
    
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: testUsername,
      Password: 'TestPassword123!',
      Permanent: true,
    });
    
    await client.send(setPasswordCommand);
    console.log('✅ Password set successfully');
    
    console.log('');
    console.log('🎉 Cognito integration test successful!');
    console.log('');
    console.log('📝 Test user details:');
    console.log(`   Username: ${testUsername}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: TestPassword123!`);
    console.log('');
    console.log('🔗 You can now test the registration endpoint with these credentials');
    
  } catch (error) {
    console.error('❌ Cognito test failed:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('1. Check your AWS credentials in backend/.env');
      console.log('2. Ensure your AWS user has Cognito permissions');
      console.log('3. Verify the User Pool ID is correct');
    }
    
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  testCognitoConnection();
}

module.exports = { testCognitoConnection };
