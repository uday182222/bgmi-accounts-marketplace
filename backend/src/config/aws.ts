import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { KMSClient } from '@aws-sdk/client-kms';
import { SESClient } from '@aws-sdk/client-ses';
import { SNSClient } from '@aws-sdk/client-sns';

// Environment variable getter with validation
const getEnv = (key: string, required = true): string => {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value || "";
};

// Environment variable getters
export const AWS_REGION = () => getEnv("AWS_REGION", false) || 'eu-north-1';
export const AWS_ACCESS_KEY_ID = () => getEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = () => getEnv("AWS_SECRET_ACCESS_KEY");

// Credential encryption key
export const credentialEncryptionKey = () => getEnv("CREDENTIAL_ENCRYPTION_KEY", false) || 'default-encryption-key-change-in-production';
export const COGNITO_USER_POOL_ID = () => getEnv("COGNITO_USER_POOL_ID");
export const COGNITO_USER_POOL_CLIENT_ID = () => getEnv("COGNITO_USER_POOL_CLIENT_ID");
export const COGNITO_USER_POOL_CLIENT_SECRET = () => getEnv("COGNITO_USER_POOL_CLIENT_SECRET", false);
export const COGNITO_IDENTITY_POOL_ID = () => getEnv("COGNITO_IDENTITY_POOL_ID", false);
export const GOOGLE_CLIENT_ID = () => getEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = () => getEnv("GOOGLE_CLIENT_SECRET");
export const S3_BUCKET_NAME = () => getEnv("S3_BUCKET_NAME", false) || 'bgmi-accounts-storage';

// AWS Configuration - lazy loaded to ensure env vars are available
function getAwsConfig() {
  return {
    region: AWS_REGION(),
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID(),
      secretAccessKey: AWS_SECRET_ACCESS_KEY(),
    },
  };
}

// Initialize AWS clients - lazy loaded
let _cognitoClient: CognitoIdentityProviderClient;
let _s3Client: S3Client;
let _dynamoClient: DynamoDBClient;
let _kmsClient: KMSClient;
let _sesClient: SESClient;
let _snsClient: SNSClient;

export const cognitoClient = () => {
  if (!_cognitoClient) {
    _cognitoClient = new CognitoIdentityProviderClient(getAwsConfig());
  }
  return _cognitoClient;
};

export const s3Client = () => {
  if (!_s3Client) {
    _s3Client = new S3Client(getAwsConfig());
  }
  return _s3Client;
};

export const dynamoClient = () => {
  if (!_dynamoClient) {
    _dynamoClient = new DynamoDBClient(getAwsConfig());
  }
  return _dynamoClient;
};

export const kmsClient = () => {
  if (!_kmsClient) {
    _kmsClient = new KMSClient(getAwsConfig());
  }
  return _kmsClient;
};

export const sesClient = () => {
  if (!_sesClient) {
    _sesClient = new SESClient(getAwsConfig());
  }
  return _sesClient;
};

export const snsClient = () => {
  if (!_snsClient) {
    _snsClient = new SNSClient(getAwsConfig());
  }
  return _snsClient;
};

// AWS Resource Configuration
export const AWS_CONFIG = {
  get region() { return AWS_REGION(); },
  get accessKeyId() { return AWS_ACCESS_KEY_ID(); },
  get secretAccessKey() { return AWS_SECRET_ACCESS_KEY(); },
  get userPoolId() { return COGNITO_USER_POOL_ID(); },
  get userPoolClientId() { return COGNITO_USER_POOL_CLIENT_ID(); },
  get userPoolClientSecret() { return COGNITO_USER_POOL_CLIENT_SECRET(); },
  get identityPoolId() { return COGNITO_IDENTITY_POOL_ID(); },
  get googleClientId() { return GOOGLE_CLIENT_ID(); },
  get googleClientSecret() { return GOOGLE_CLIENT_SECRET(); },
  get s3BucketName() { return S3_BUCKET_NAME(); },
  get dynamoTablePrefix() { return getEnv("DYNAMO_TABLE_PREFIX", false) || 'bgmi-accounts'; },
  get kmsKeyId() { return getEnv("KMS_KEY_ID", false) || 'alias/bgmi-accounts-credentials'; },
  get sesFromEmail() { return getEnv("SES_FROM_EMAIL", false) || 'noreply@bgmi-accounts.com'; },
  get snsTopicArn() { return getEnv("SNS_TOPIC_ARN", false) || ''; },
};

export default AWS_CONFIG;
