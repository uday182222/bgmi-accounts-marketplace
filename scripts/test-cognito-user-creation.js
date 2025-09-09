const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
require('dotenv').config();

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testCognitoUserCreation() {
  console.log('🔍 Testing Cognito user creation...');
  
  try {
    const command = new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: 'test@example.com',
      UserAttributes: [
        {
          Name: 'email',
          Value: 'test@example.com'
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ],
      TemporaryPassword: 'TempPass123!',
      MessageAction: 'SUPPRESS' // Don't send welcome email
    });

    const result = await cognitoClient.send(command);
    console.log('✅ User created successfully:', result.User);
    
    // Clean up - delete the test user
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: 'test@example.com'
    });
    
    await cognitoClient.send(deleteCommand);
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.error('Error details:', error);
  }
}

testCognitoUserCreation();
