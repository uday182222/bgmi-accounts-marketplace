# 🎮 BGMI Accounts Marketplace

A comprehensive admin-mediated marketplace for buying and selling BGMI (Battlegrounds Mobile India) accounts with secure credential transfer, real-time negotiation, and integrated payment processing.

## 🌟 Features

- **Admin-Mediated Marketplace** - Sellers submit listings to admin for negotiation and approval
- **Google Sign-In Integration** - OAuth2.0 federated login alongside email/password
- **Secure Credential Transfer** - AES-256-GCM encrypted credential storage
- **Real-time Negotiation Chat** - Socket.IO powered communication between sellers and admin
- **Stripe Payment Integration** - 15% platform fee with Connect for seller payouts
- **Safe Transfer System** - Admin-adjustable 1-2 day monitoring period
- **Protection Plan** - 10-day redemption period for buyers and sellers
- **KYC Verification** - Simplified ID + selfie upload system
- **Mobile-Responsive Design** - Dark gaming theme optimized for all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 13+
- **AWS Account** (for Cognito)
- **Stripe Account** (for payments)
- **Google Cloud Console** (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/uday182222/bgmi-accounts-marketplace.git
cd bgmi-accounts-marketplace
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Backend Environment Variables

Create `backend/.env` file:

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

#### Frontend Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Database Setup

```bash
# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Ubuntu/Debian)
sudo systemctl start postgresql

# Create database
createdb bgmi_marketplace

# Run migrations
cd backend
npm run migrate
cd ..
```

### 5. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 🔧 Service Configuration

### AWS Cognito Setup

1. **Create User Pool:**
   - Go to AWS Cognito Console
   - Create new User Pool with email sign-in
   - Add Google as identity provider
   - Create app client

2. **Configure Google OAuth:**
   - Add authorized origins: `http://localhost:3000`
   - Set up attribute mapping

### Stripe Setup

1. **Create Stripe Account:**
   - Sign up at https://stripe.com
   - Get API keys from dashboard
   - Set up webhooks for payment events

2. **Configure Webhooks:**
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Google OAuth Setup

1. **Create Google Cloud Project:**
   - Go to Google Cloud Console
   - Create new project
   - Enable Google+ API

2. **Create OAuth Credentials:**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized origins: `http://localhost:3000`

## 📁 Project Structure

```
bgmi-accounts-marketplace/
├── src/                          # Frontend (Next.js)
│   ├── app/                      # App Router pages
│   │   ├── admin/               # Admin dashboard
│   │   ├── dashboard/           # User dashboard
│   │   ├── marketplace/         # Public marketplace
│   │   ├── list-account/        # Seller listing form
│   │   └── ...
│   ├── components/              # Reusable UI components
│   ├── contexts/                # React contexts
│   └── lib/                     # Utilities and API client
├── backend/                     # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/         # API route handlers
│   │   ├── services/            # Business logic
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   └── middleware/          # Express middleware
│   └── migrations/              # Database migrations
├── docs/                        # Documentation
├── scripts/                     # Setup and utility scripts
└── public/                      # Static assets
```

## 🛠️ Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm run start        # Start production server
npm run migrate      # Run database migrations
```

### Database Migrations

```bash
cd backend
npm run migrate
```

### Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables:**
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Backend (Railway/AWS)

1. **Railway Deployment:**
   ```bash
   npm i -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Set Environment Variables:**
   - All backend environment variables
   - Update `DATABASE_URL` for production

### Database (PostgreSQL)

1. **Production Database:**
   - Use managed PostgreSQL (AWS RDS, Railway, etc.)
   - Update `DATABASE_URL` in production environment

## 🔐 Security Features

- **Credential Encryption** - AES-256-GCM encryption for sensitive data
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Zod schema validation
- **Rate Limiting** - API rate limiting
- **CORS Protection** - Configured CORS policies
- **Environment Variables** - No secrets in code

## 📱 User Flows

### Seller Journey
1. Register/Login → Dashboard
2. Submit Account Listing → Admin Review
3. Negotiate with Admin → Submit Credentials
4. Safe Transfer Period → Receive Payout

### Buyer Journey
1. Browse Marketplace → View Approved Listings
2. Purchase Account → Payment Processing
3. Receive Credentials → Safe Transfer Period
4. Account Transfer Complete

### Admin Journey
1. Review Submitted Listings → Negotiate with Sellers
2. Approve/Reject Listings → Monitor Transfers
3. Handle Disputes → Manage Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation:** Check the `docs/` folder
- **Issues:** Create a GitHub issue
- **Setup Help:** See `scripts/admin-setup-guide.md`

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced KYC verification
- [ ] Automated account verification
- [ ] Advanced dispute resolution system

---

**Built with ❤️ for the BGMI gaming community**