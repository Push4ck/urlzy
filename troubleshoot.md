# Troubleshooting MIME Type Error

## The Error

```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## Quick Fix (Most Common Solution)

**The issue is likely that Vite started on the wrong port (5173 instead of 3000).**

### Solution:

1. Stop any running servers (Ctrl+C)
2. Run the startup script:

   ```bash
   # Windows PowerShell
   .\start-dev.ps1

   # Or Windows Command Prompt
   start-dev.bat

   # Or manually
   npm run dev
   ```

3. Make sure the client opens at `http://localhost:3000` (not 5173)
4. Clear browser cache and refresh

## Common Causes & Solutions

### 1. Browser Cache Issues

**Solution**: Clear browser cache completely

- Chrome: Ctrl+Shift+Delete → Clear all data
- Or use incognito/private mode
- Or hard refresh: Ctrl+Shift+R

### 2. Vite Development Server Issues

**Solution**: Restart the development server

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd client
npm run dev
```

### 3. Node Modules Cache

**Solution**: Clear Vite cache

```bash
cd client
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### 4. Port Conflicts

**Solution**: Check if port 3000 is properly available

```bash
# Kill any process on port 3000
npx kill-port 3000
# Then restart
npm run dev
```

### 5. File Extension Issues

**Solution**: Ensure all imports have proper extensions

- Check that `main.jsx` exists (not `main.js`)
- Verify all React components use `.jsx` extension
- Check import statements in `main.jsx`

### 6. Antivirus/Security Software

**Solution**: Some antivirus software blocks module scripts

- Temporarily disable antivirus
- Add project folder to antivirus exceptions
- Check Windows Defender settings

### 7. Network/Proxy Issues

**Solution**: Check network configuration

- Disable VPN temporarily
- Check corporate proxy settings
- Try different network

## Step-by-Step Debugging

### Step 1: Verify Files Exist

```bash
cd client
ls -la src/main.jsx
ls -la index.html
```

### Step 2: Check Vite Config

```bash
cd client
cat vite.config.js
```

### Step 3: Test with Fresh Browser

- Open incognito/private window
- Navigate to http://localhost:3000
- Check browser console for errors

### Step 4: Check Development Server

```bash
cd client
npm run dev -- --host 0.0.0.0 --port 3001
```

Then try http://localhost:3001

### Step 5: Verify Dependencies

```bash
cd client
npm list @vitejs/plugin-react
npm list vite
```

### Step 6: Complete Reset

```bash
# From project root
rm -rf client/node_modules
rm -rf client/dist
rm -rf client/.vite
cd client
npm install
npm run dev
```

## Alternative Solutions

### Use Different Port

```bash
cd client
npm run dev -- --port 3001
```

### Force Vite Rebuild

```bash
cd client
npm run dev -- --force
```

### Check System Configuration

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if localhost resolves correctly
ping localhost
```

## If Nothing Works

### Try Basic HTML Test

Create a simple `test.html` in the client folder:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Basic HTML Test</h1>
    <script type="module">
      console.log("Module script works");
    </script>
  </body>
</html>
```

Open directly in browser to test if module scripts work at all.

### Check Windows-Specific Issues

- Run PowerShell as Administrator
- Check Windows Defender exclusions
- Verify file permissions on project folder
- Try running from different drive (C: vs D: etc.)

### Contact Support

If none of these solutions work, the issue might be:

- Windows-specific configuration
- Corporate network restrictions
- Antivirus interference
- System-level Node.js installation issues

Provide these details when seeking help:

- Operating System version
- Node.js version (`node --version`)
- Browser version
- Antivirus software
- Network configuration (corporate/home)
- Full error message from browser console
