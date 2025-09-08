# URLzy - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [API Documentation](#api-documentation)
6. [Database Models](#database-models)
7. [Security Features](#security-features)
8. [Authentication & Authorization](#authentication--authorization)
9. [Frontend Components](#frontend-components)
10. [Testing Framework](#testing-framework)
11. [Monitoring & Logging](#monitoring--logging)
12. [Backup & Recovery](#backup--recovery)
13. [Deployment Guide](#deployment-guide)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

**URLzy** is a comprehensive URL shortening service built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides users with the ability to create short, shareable links with advanced analytics, user authentication, and rate limiting features.

### Key Features

- **URL Shortening**: Convert long URLs into short, customizable links
- **User Authentication**: JWT-based authentication with email verification
- **Analytics Dashboard**: Track clicks, referrers, and user activity
- **Rate Limiting**: Different limits for anonymous vs authenticated users
- **Custom Short Codes**: Users can create custom short codes (3-20 characters)
- **URL Expiration**: Configurable expiration for anonymous URLs
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Multi-language Support**: Internationalization with i18next
- **Admin Panel**: Administrative features for system management
- **Payment Integration**: Razorpay integration for premium features
- **Maintenance Mode**: System maintenance capabilities
- **Health Monitoring**: Comprehensive system health checks

### User Types

1. **Anonymous Users**
   - Limited to 5 URLs per day
   - URLs expire after 30 days
   - Basic analytics access

2. **Registered Users**
   - Unlimited URL creation
   - URLs never expire
   - Full analytics dashboard
   - Custom short codes
   - Profile management

3. **Admin Users**
   - Full system access
   - User management
   - System-wide analytics
   - System settings management

---

## Architecture & Tech Stack

### Backend (Node.js/Express)

**Core Dependencies:**
- **Express.js** (4.18.2) - Web framework
- **MongoDB** (6.3.0) + **Mongoose** (8.1.1) - Database and ODM
- **JWT** (9.0.2) - Authentication tokens
- **bcryptjs** (2.4.3) - Password hashing
- **express-validator** (7.2.1) - Input validation
- **express-rate-limit** (7.5.1) - Rate limiting
- **helmet** (7.1.0) - Security headers
- **cors** (2.8.5) - Cross-origin requests
- **compression** (1.8.1) - Response compression
- **winston** (3.11.0) - Logging framework
- **nodemailer** (6.9.13) - Email service
- **razorpay** (2.9.6) - Payment processing
- **ioredis** (5.4.1) - Redis client for caching
- **rate-limiter-flexible** (5.0.3) - Advanced rate limiting

### Frontend (React/Vite)

**Core Dependencies:**
- **React** (18.2.0) - UI framework
- **React Router DOM** (6.30.1) - Client-side routing
- **Axios** (1.6.7) - HTTP client
- **Tailwind CSS** (4.1.13) - Utility-first CSS
- **React Hot Toast** (2.6.0) - Notification system
- **Lucide React** (0.542.0) - Icon library
- **i18next** (23.7.6) - Internationalization
- **React i18next** (13.5.0) - React integration for i18n

---

## Project Structure

```
urlzy/
├── client/                          # React frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── contexts/                # React contexts for state management
│   │   ├── data/                    # Static data files
│   │   ├── locales/                 # Internationalization files
│   │   ├── config/                  # Configuration files
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # App entry point
│   │   ├── index.css                # Global styles
│   │   └── i18n.js                  # i18n configuration
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── index.html                   # HTML template
│   └── netlify.toml                 # Netlify deployment config
│
├── server/                          # Node.js backend
│   ├── middleware/                  # Custom middleware
│   ├── models/                      # MongoDB models
│   ├── routes/                      # API route handlers
│   ├── utils/                       # Utility functions
│   ├── scripts/                     # Utility scripts
│   ├── tests/                       # Test files
│   ├── uploads/                     # File uploads directory
│   ├── server.js                    # Main server file
│   └── package.json
│
├── package.json                     # Root workspace config
├── README.md                        # Project README
└── .gitignore                       # Git ignore rules
```

---

## Installation & Setup

### Prerequisites

- **Node.js** version 18.0.0 or higher
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)
- **npm** or **yarn** package manager

### Quick Start

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

3. **Environment Configuration**

   **Server Environment (.env in /server/)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/urlzy
   BASE_URL=http://localhost:5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

   **Client Environment (.env in /client/)**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_BASE_URL=http://localhost:5000
   ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### URL Management Endpoints

#### POST /api/urls/shorten
Create a new shortened URL.

**Headers:**
```
Authorization: Bearer <jwt_token> (optional)
```

**Request Body:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "customCode": "mycustomcode"
}
```

**Response:**
```json
{
  "success": true,
  "message": "URL shortened successfully",
  "url": {
    "id": "url_id",
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:5000/abc123",
    "clicks": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-31T00:00:00.000Z"
  }
}
```

#### GET /api/urls/list
Get list of URLs for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "urls": [
    {
      "id": "url_id",
      "originalUrl": "https://example.com",
      "shortCode": "abc123",
      "shortUrl": "http://localhost:5000/abc123",
      "clicks": 42,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### URL Redirect Endpoint

#### GET /:shortCode
Redirect to the original URL.

**Response:** HTTP 302 redirect to original URL

---

## Database Models

### User Model
```javascript
{
  username: String,      // Required, unique, 3-30 chars
  email: String,         // Required, unique, validated
  password: String,      // Required, hashed with bcrypt
  role: String,          // 'user' or 'admin', default 'user'
  isVerified: Boolean,   // Email verification status
  createdAt: Date,       // Auto-generated timestamp
  lastLogin: Date,       // Last login timestamp
  urlsCreated: Number    // Count of URLs created
}
```

### URL Model
```javascript
{
  originalUrl: String,   // Required, validated URL
  shortCode: String,     // Required, unique, 3-20 chars
  userId: ObjectId,      // Reference to User (optional)
  isAnonymous: Boolean,  // Default false
  clicks: Number,        // Default 0
  createdAt: Date,       // Auto-generated
  expiresAt: Date,       // Null for registered users
  isActive: Boolean      // Default true
}
```

### ClickEvent Model
```javascript
{
  urlId: ObjectId,       // Reference to URL
  userId: ObjectId,      // Reference to User (optional)
  ipAddress: String,     // Client IP address
  userAgent: String,     // Browser user agent
  referrer: String,      // Referring URL
  clickedAt: Date        // Auto-generated timestamp
}
```

---

## Security Features

### Authentication & Authorization

1. **JWT Token Authentication**
   - Stateless authentication using JSON Web Tokens
   - Tokens expire after 24 hours
   - Secure token storage and transmission

2. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum password length requirements
   - Password reset functionality with secure tokens

3. **Email Verification**
   - Required email verification for new accounts
   - Secure verification tokens with expiration

### Input Validation & Sanitization

1. **Express Validator**
   - Comprehensive input validation for all endpoints
   - Custom validation rules for URLs, emails, passwords

2. **MongoDB Injection Protection**
   - express-mongo-sanitize middleware
   - Automatic sanitization of MongoDB operators

### Rate Limiting

1. **Anonymous Users**: Limited to 5 URLs per day
2. **Authenticated Users**: Higher limits based on user role
3. **API Protection**: IP-based rate limiting to prevent abuse

### Security Headers

1. **Helmet.js Configuration**
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Frame-Options to prevent clickjacking
   - X-Content-Type-Options for MIME sniffing protection

---

## Testing Framework

### Backend Testing

#### Jest Configuration
- Complete test suite setup
- API endpoint testing with Supertest
- MongoDB Memory Server for isolated testing
- Test coverage reporting

#### Running Tests
```bash
cd server
npm test
npm run test:coverage
npm run test:watch
```

### Test Structure
```
server/tests/
├── auth.test.js      # Authentication tests
├── setup.js          # Test configuration
└── jest.config.js    # Jest configuration
```

---

## Monitoring & Logging

### Winston Logger Configuration

The application uses Winston for structured logging with multiple transports:
- **Console logging** for development
- **File logging** for production (error.log, combined.log)
- **HTTP request logging** via Morgan

### Health Monitoring

#### Basic Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Quick system status check
- **Checks**: Database connectivity, email service

#### Detailed Health Check
- **Endpoint**: `GET /health/detailed`
- **Purpose**: Comprehensive system monitoring
- **Metrics**: Memory usage, CPU usage, database stats

### Error Tracking

Centralized error handling and logging with detailed stack traces and request context information.

---

## Backup & Recovery

### Automated Backup System

The application includes a comprehensive backup system:
- **Daily automated backups** with retention policies
- **MongoDB dump** with compression support
- **Cloud storage ready** (AWS S3, Google Cloud, Azure)
- **Restore scripts** for complete recovery

### Backup Commands
```bash
cd server
npm run backup
npm run backup:compress
```

---

## Deployment Guide

### Production Environment Setup

#### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlzy

# Application
BASE_URL=https://your-domain.com
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret-here
NODE_ENV=production
```

#### Build Commands
```bash
# Install dependencies
npm install
npm run install:all

# Build frontend
npm run build

# Start production server
npm start
```

### Docker Deployment

The application supports Docker deployment with pre-configured Dockerfiles and docker-compose setup for easy containerization.

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
**Problem**: MongoDB connection fails
**Solution**:
1. Check MongoDB URI in environment variables
2. Verify network access to MongoDB instance
3. Check MongoDB Atlas IP whitelist

#### Email Service Issues
**Problem**: Emails not being sent
**Solution**:
1. Verify email credentials in environment variables
2. Check Gmail app password if using Gmail
3. Verify SMTP server settings

#### CORS Issues
**Problem**: Frontend can't connect to backend
**Solution**:
1. Verify CLIENT_URL in server environment
2. Check CORS configuration in server.js

#### JWT Token Issues
**Problem**: Authentication fails
**Solution**:
1. Verify JWT_SECRET is set
2. Check token expiration
3. Ensure correct token format in Authorization header

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev --workspace=server
DEBUG=vite:* npm run dev --workspace=client
```

---

## Future Enhancements

### Planned Features

#### Advanced Analytics
- Real-time analytics dashboard
- Geographic click distribution
- Click heatmaps
- Conversion tracking
- A/B testing for URLs

#### User Experience
- Bulk URL operations
- URL expiration customization
- Custom domain support
- QR code generation
- URL preview feature

#### Performance Optimizations
- Redis caching layer
- CDN integration
- Database connection pooling
- Image optimization

#### Security Enhancements
- Two-factor authentication
- API key management
- Advanced rate limiting
- Audit logging

### Technical Improvements
- TypeScript migration
- End-to-end testing
- Database migration system
- API versioning strategy

---

## Support

### Getting Help

1. **Documentation**: Check this comprehensive documentation first
2. **GitHub Issues**: Create an issue for bugs or feature requests
3. **Community**: Join our Discord community for discussions
4. **Email**: Contact the maintainer at pushkarcodes@gmail.com

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### License

This project is licensed under the ISC License.