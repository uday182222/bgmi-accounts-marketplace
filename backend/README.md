# BGMI Accounts Service - Backend API

A comprehensive backend API for the BGMI Accounts marketplace built with Node.js, Express, and TypeScript.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Account Management**: CRUD operations for gaming accounts
- **Payment Processing**: Stripe integration for secure payments
- **Real-time Messaging**: Socket.IO for instant communication
- **Image Upload**: AWS S3 integration for file storage
- **Email Services**: SendGrid integration for notifications
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (planned)
- **Authentication**: JWT
- **Payments**: Stripe
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Real-time**: Socket.IO
- **Validation**: Joi + express-validator

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL (for production)
- Redis (for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bgmi_accounts
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
# ... other variables
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/account` - Delete account
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/seller/:userId` - Get seller profile

### Accounts
- `GET /api/accounts` - Get all accounts (with pagination)
- `GET /api/accounts/featured` - Get featured accounts
- `GET /api/accounts/search` - Search accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create new account (protected)
- `PUT /api/accounts/:id` - Update account (protected)
- `DELETE /api/accounts/:id` - Delete account (protected)
- `GET /api/accounts/user/my-accounts` - Get user's accounts (protected)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/refund` - Process refund

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversations/:id` - Get conversation by ID
- `GET /api/messages/messages` - Get messages in conversation
- `POST /api/messages/send` - Send message
- `PUT /api/messages/mark-read` - Mark messages as read
- `DELETE /api/messages/:id` - Delete message

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **SQL Injection Protection**: Parameterized queries

## Environment Variables

See `env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
