const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Connection() {
  try {
    console.log('🔍 Testing S3 connection...');
    
    // Test 1: List buckets
    console.log('\n1. Listing available buckets:');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    
    listResponse.Buckets.forEach(bucket => {
      console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });
    
    // Test 2: Check if our bucket exists
    const bucketName = process.env.S3_BUCKET_NAME;
    if (bucketName) {
      console.log(`\n2. Checking bucket "${bucketName}":`);
      try {
        const headCommand = new HeadBucketCommand({ Bucket: bucketName });
        await s3Client.send(headCommand);
        console.log(`   ✅ Bucket "${bucketName}" exists and is accessible`);
      } catch (error) {
        if (error.name === 'NotFound') {
          console.log(`   ❌ Bucket "${bucketName}" not found`);
          console.log(`   💡 Please create the bucket first or check the bucket name in .env`);
        } else {
          console.log(`   ❌ Error accessing bucket: ${error.message}`);
        }
      }
    } else {
      console.log('\n2. No S3_BUCKET_NAME specified in environment variables');
    }
    
    console.log('\n✅ S3 connection test completed');
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your AWS credentials in .env file');
    console.log('   2. Verify AWS region is correct (us-east-1)');
    console.log('   3. Ensure your AWS user has S3 permissions');
    console.log('   4. Check if your AWS account is active');
  }
}

// Run the test
testS3Connection();
