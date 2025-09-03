# 🚀 Quick Start Guide

## The MIME Type Error Fix

The error you're seeing is because the Vite dev server started on port 5173 instead of 3000, and there might be some configuration issues.

## Simple Solution (2 Terminal Windows)

### Terminal 1 - Start Backend Server

```bash
cd server
npm run dev
```

This should start the server on http://localhost:5000

### Terminal 2 - Start Frontend Client

```bash
cd client
npm run dev
```

This should start the client on http://localhost:3000

## If Client Starts on Wrong Port (5173)

If the client starts on port 5173 instead of 3000:

1. **Stop the client server** (Ctrl+C)
2. **Clear the cache**:
   ```bash
   cd client
   rmdir /s /q node_modules\.vite
   rmdir /s /q dist
   ```
3. **Start again**:
   ```bash
   npm run dev
   ```

## Environment Setup

Make sure you have these files:

### server/.env

```env
MONGODB_URI=mongodb://localhost:27017/urlzy
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### client/.env

```env
VITE_API_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

## Browser Issues

1. **Clear browser cache** completely (Ctrl+Shift+Delete)
2. **Use incognito mode** to test
3. **Hard refresh** (Ctrl+Shift+R)
4. Make sure you're visiting **http://localhost:3000** (not 5173)

## If Still Not Working

### Check Node.js Version

```bash
node --version
```

Should be v18 or higher.

### Reinstall Dependencies

```bash
# From project root
cd client
rmdir /s /q node_modules
npm install

cd ../server
rmdir /s /q node_modules
npm install
```

### Test Basic Functionality

1. Visit http://localhost:5000/health - should show server status
2. Visit http://localhost:3000 - should show the React app

## Success Indicators

✅ **Server running**: Console shows "Server running on port 5000"  
✅ **Client running**: Console shows "Local: http://localhost:3000"  
✅ **MongoDB connected**: Console shows "MongoDB connected"  
✅ **No CORS errors**: Browser console is clean

## Common Port Issues

If ports are in use:

```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 5000
```

## Need Help?

If you're still getting the MIME type error:

1. Check which port the client is actually running on
2. Make sure you're accessing the correct URL
3. Clear all browser data
4. Try a different browser
5. Check Windows Defender/antivirus settings

The most common cause is accessing the wrong port or having cached files.
