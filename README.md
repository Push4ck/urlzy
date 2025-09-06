# URLzy - URL Shortener Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for shortening URLs with analytics, user authentication, and rate limiting.

## 🚀 Features

### Core Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Short Codes**: Users can create custom short codes (3-20 characters)
- **Analytics**: Track clicks, referrers, and user activity
- **User Authentication**: Register/login system with JWT tokens
- **Rate Limiting**: 5 URLs per day for anonymous users, unlimited for registered users
- **URL Expiration**: Anonymous URLs expire after 30 days, registered user URLs never expire
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### User Types

- **Anonymous Users**: Limited to 5 URLs per day with 30-day expiration
- **Registered Users**: Unlimited URLs with no expiration, personal dashboard
- **Admin Users**: Full access to all features (extensible)

## 🛠 Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **express-rate-limit** for rate limiting
- **helmet** for security headers
- **cors** for cross-origin requests

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Context API** for state management

## 📁 Project Structure

```
urlzy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── config/        # API configuration
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   ├── package.json
│   └── ...
├── package.json         # Root workspace configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd urlzy
   ```

2. **Install dependencies**

   ```bash
   npm install
   npm run install:all
   ```

3. **Environment Setup**

   Create `.env` files in both `server/` and `client/` directories:

   **Server (.env)**

   ```env
   MONGODB_URI=mongodb://localhost:27017/urlzy
   BASE_URL=http://localhost:5000
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

   **Client (.env)**

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_BASE_URL=http://localhost:5000
   ```

4. **Start the application**

   ```bash
   # Development mode (both client and server)
   npm run dev

   # Or start individually
   npm run dev --workspace=server  # Backend only
   npm run dev --workspace=client  # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### URL Management Endpoints

- `POST /api/urls/shorten` - Create short URL
- `GET /api/urls/list` - List URLs (filtered by user)
- `GET /api/urls/:shortCode` - Get URL info
- `DELETE /api/urls/:shortCode` - Delete URL
- `GET /:shortCode` - Redirect to original URL

### Billing Endpoints (Mock)

- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/razorpay/order` - Create Razorpay order
- `POST /api/billing/razorpay/verify` - Verify payment

## 🔧 Recent Fixes & Improvements

### Backend Fixes

1. **Route Organization**: Separated API routes from redirect routes to prevent conflicts
2. **Authentication Middleware**: Created reusable auth middleware with optional authentication
3. **Rate Limiting**: Improved rate limiting to skip authenticated users
4. **Environment Variables**: Added fallback values for missing environment variables
5. **Input Validation**: Enhanced validation for custom codes and URLs
6. **Error Handling**: Improved error responses and logging
7. **Database Queries**: Optimized queries with proper indexing

### Frontend Fixes

1. **ESLint Configuration**: Fixed ESLint config for modern React development
2. **API Integration**: Updated all components to use centralized API configuration
3. **Error Handling**: Added proper error handling and user feedback
4. **Analytics**: Implemented real analytics data fetching instead of mock data
5. **Authentication Flow**: Improved user authentication and token management
6. **Responsive Design**: Enhanced mobile responsiveness

### Project Structure

1. **Workspace Configuration**: Set up proper npm workspaces for monorepo management
2. **Package Management**: Cleaned up duplicate dependencies and package.json files
3. **Build Scripts**: Added convenient scripts for development and production

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Required email verification for new accounts
- **Password Reset**: Secure password reset with OTP via email
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against abuse with Redis support
- **CORS Configuration**: Proper cross-origin request handling
- **Helmet**: Security headers for production
- **MongoDB Sanitization**: Protection against NoSQL injection
- **Environment Variables**: Sensitive data protection

## 📊 Analytics Features

- **Click Tracking**: Track total clicks per URL
- **Referrer Analysis**: See where traffic is coming from
- **User Activity**: Monitor recent access patterns
- **Dashboard Statistics**: Overview of user's URL performance

## 🔍 Production Features

### Monitoring & Logging
- **Winston Logging**: Structured logging with multiple transports
- **HTTP Request Logging**: Morgan integration for request tracking
- **Health Checks**: Comprehensive system health monitoring
  - `/health` - Basic health check
  - `/health/detailed` - Detailed system metrics
- **Error Tracking**: Centralized error handling and logging

### Testing
- **Jest Framework**: Complete test suite setup
- **Supertest**: API endpoint testing
- **MongoDB Memory Server**: Isolated test database
- **Test Coverage**: Code coverage reporting

### Backup & Recovery
- **Automated Backups**: Daily database backups with retention
- **Compression Support**: Optional gzip compression
- **Cloud Storage Ready**: Compatible with AWS S3, Google Cloud, Azure
- **Restore Scripts**: Complete recovery procedures documented

## 🚀 Deployment

### Production Environment Variables

**Server**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlzy
BASE_URL=https://your-domain.com
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

**Client**

```env
VITE_API_URL=https://your-api-domain.com
VITE_BASE_URL=https://your-api-domain.com
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Testing
npm test
npm run test:coverage

# Database backup
npm run backup
npm run backup:compress
```

### Health Check Endpoints

```bash
# Basic health check
curl http://localhost:5000/health

# Detailed health check with metrics
curl http://localhost:5000/health/detailed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Future Improvements

### Recently Implemented ✅

- [x] Email verification for user registration
- [x] Password reset functionality
- [x] Automated testing framework
- [x] Production monitoring and logging
- [x] Comprehensive health checks
- [x] Database backup strategies

### Planned Features

- [ ] Bulk URL operations
- [ ] Advanced analytics with charts
- [ ] QR code generation for URLs
- [ ] URL preview before redirect
- [ ] Custom domains support
- [ ] API rate limiting per user tier

### Performance Optimizations

- [ ] Redis caching for frequently accessed URLs
- [ ] Database connection pooling
- [ ] CDN integration for static assets
- [ ] Image optimization

## 📞 Support

For support, email pushkarcodes@gmail.com or create an issue in the repository.
