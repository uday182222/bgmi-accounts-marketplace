const { CognitoIdentityProviderClient, ListUserPoolsCommand, DescribeUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');
require('dotenv').config();

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testCognitoSetup() {
  try {
    console.log('🔍 Testing Cognito setup...');
    
    // Test 1: List user pools
    console.log('\n1. Listing user pools:');
    const listCommand = new ListUserPoolsCommand({ MaxResults: 10 });
    const listResponse = await cognitoClient.send(listCommand);
    
    if (listResponse.UserPools && listResponse.UserPools.length > 0) {
      listResponse.UserPools.forEach(pool => {
        console.log(`   - ${pool.Name} (ID: ${pool.Id})`);
      });
    } else {
      console.log('   ⚠️  No user pools found');
    }
    
    // Test 2: Check specific user pool
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (userPoolId) {
      console.log(`\n2. Checking user pool "${userPoolId}":`);
      try {
        const describeCommand = new DescribeUserPoolCommand({ UserPoolId: userPoolId });
        const describeResponse = await cognitoClient.send(describeCommand);
        
        console.log('   ✅ User pool found');
        console.log('   Name:', describeResponse.UserPool.Name);
        console.log('   Status:', describeResponse.UserPool.Status);
        console.log('   Creation Date:', describeResponse.UserPool.CreationDate);
        
        // Check app clients
        if (describeResponse.UserPool.UserPoolClients) {
          console.log('   App Clients:', describeResponse.UserPool.UserPoolClients.length);
          describeResponse.UserPool.UserPoolClients.forEach(client => {
            console.log(`     - ${client.ClientName} (ID: ${client.ClientId})`);
          });
        }
        
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          console.log('   ❌ User pool not found');
          console.log('   💡 Please create the user pool first');
        } else {
          console.log(`   ❌ Error accessing user pool: ${error.message}`);
        }
      }
    } else {
      console.log('\n2. No COGNITO_USER_POOL_ID specified in environment variables');
    }
    
    console.log('\n✅ Cognito setup test completed');
    
  } catch (error) {
    console.error('❌ Cognito test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your AWS credentials in .env file');
    console.log('   2. Verify AWS region is correct (us-east-1)');
    console.log('   3. Ensure your AWS user has Cognito permissions');
    console.log('   4. Make sure you have created a user pool');
  }
}

// Run the test
testCognitoSetup();
