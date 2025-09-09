require('dotenv').config();

console.log('🔍 Testing environment variable loading...');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || '❌ Not set');
console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID || '❌ Not set');

// Test AWS client creation
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');

try {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('✅ AWS client created successfully');
} catch (error) {
  console.log('❌ Error creating AWS client:', error.message);
}
