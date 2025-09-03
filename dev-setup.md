# Development Setup Guide

## Quick Start Commands

### First Time Setup

```bash
# Install all dependencies
npm install
npm run install:all

# Set up environment variables (copy and modify)
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Development

```bash
# Start both client and server
npm run dev

# Start only server (port 5000)
npm run dev --workspace=server

# Start only client (port 3000)
npm run dev --workspace=client
```

### Testing & Quality

```bash
# Lint client code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build
```

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `server/.env`
3. The application will create collections automatically

### Environment Variables

#### Server (.env)

```env
MONGODB_URI=mongodb://localhost:27017/urlzy
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# Optional: For Razorpay integration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Client (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### MongoDB Connection Issues

- Ensure MongoDB is running locally
- Check connection string format
- Verify network access for cloud databases

### CORS Issues

- Ensure CLIENT_URL matches your frontend URL
- Check that both servers are running
- Verify environment variables are loaded

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `npm run build --workspace=client -- --force`

## API Testing

### Test Endpoints with curl

#### Create Short URL (Anonymous)

```bash
curl -X POST http://localhost:5000/api/urls/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com"}'
```

#### Create Short URL with Custom Code

```bash
curl -X POST http://localhost:5000/api/urls/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com", "customCode": "mylink"}'
```

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

#### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Development Tips

### Hot Reload

- Both client and server support hot reload
- Server uses nodemon for automatic restarts
- Client uses Vite's fast HMR

### Debugging

- Server logs are in console
- Client errors appear in browser console
- Use React DevTools for component debugging

### Database Inspection

- Use MongoDB Compass for GUI
- Use mongo shell for CLI access
- Check indexes: `db.urls.getIndexes()`

### Performance Monitoring

- Monitor API response times
- Check database query performance
- Use browser DevTools for frontend performance
