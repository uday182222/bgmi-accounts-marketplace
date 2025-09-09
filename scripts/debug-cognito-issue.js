require('dotenv').config();

console.log('🔍 Debugging Cognito Issue...');
console.log('Environment variables:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || '❌ Not set');
console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID || '❌ Not set');
console.log('COGNITO_USER_POOL_CLIENT_ID:', process.env.COGNITO_USER_POOL_CLIENT_ID || '❌ Not set');

// Test the exact same flow as the backend
const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

async function testCognitoFlow() {
  try {
    console.log('\n🔧 Creating Cognito client...');
    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('✅ Cognito client created');

    console.log('\n🔧 Testing user creation...');
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: 'debugtest@example.com',
      UserAttributes: [
        { Name: 'email', Value: 'debugtest@example.com' },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'given_name', Value: 'Debug' },
        { Name: 'family_name', Value: 'Test' },
      ],
      TemporaryPassword: 'TempPass123!',
      MessageAction: 'SUPPRESS',
    });

    const result = await client.send(createUserCommand);
    console.log('✅ User created successfully:', result.User?.Username);
    
  } catch (error) {
    console.log('❌ Error:', error.name, error.message);
    console.log('Error details:', error);
  }
}

testCognitoFlow();
