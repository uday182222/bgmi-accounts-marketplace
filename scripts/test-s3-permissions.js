const { S3Client, GetBucketPolicyCommand, GetBucketAclCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Permissions() {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  if (!bucketName) {
    console.log('❌ S3_BUCKET_NAME not found in environment variables');
    return;
  }

  try {
    console.log(`🔍 Testing S3 permissions for bucket: ${bucketName}`);
    
    // Test 1: Check bucket policy
    console.log('\n1. Checking bucket policy...');
    try {
      const policyCommand = new GetBucketPolicyCommand({ Bucket: bucketName });
      const policyResponse = await s3Client.send(policyCommand);
      console.log('   ✅ Bucket policy exists');
      console.log('   Policy:', JSON.parse(policyResponse.Policy));
    } catch (error) {
      if (error.name === 'NoSuchBucketPolicy') {
        console.log('   ⚠️  No bucket policy found');
      } else {
        console.log(`   ❌ Error getting bucket policy: ${error.message}`);
      }
    }
    
    // Test 2: Check bucket ACL
    console.log('\n2. Checking bucket ACL...');
    try {
      const aclCommand = new GetBucketAclCommand({ Bucket: bucketName });
      const aclResponse = await s3Client.send(aclCommand);
      console.log('   ✅ Bucket ACL accessible');
      console.log('   Owner:', aclResponse.Owner);
      console.log('   Grants:', aclResponse.Grants.length, 'permissions');
    } catch (error) {
      console.log(`   ❌ Error getting bucket ACL: ${error.message}`);
    }
    
    // Test 3: Test object access (if any objects exist)
    console.log('\n3. Testing object access...');
    try {
      // Try to access a common test object
      const testKey = 'test/access-test.txt';
      const objectCommand = new GetObjectCommand({ 
        Bucket: bucketName, 
        Key: testKey 
      });
      await s3Client.send(objectCommand);
      console.log('   ✅ Object access successful');
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        console.log('   ⚠️  No test object found (this is normal)');
      } else if (error.name === 'AccessDenied') {
        console.log('   ❌ Access denied - check permissions');
      } else {
        console.log(`   ⚠️  Object access test failed: ${error.message}`);
      }
    }
    
    console.log('\n✅ S3 permissions test completed');
    
  } catch (error) {
    console.error('❌ S3 permissions test failed:', error.message);
  }
}

// Run the test
testS3Permissions();
