#!/usr/bin/env node

/**
 * Production Verification Script for URLzy
 * Run this script to verify your production setup
 */

const https = require('https');
const http = require('http');

const PRODUCTION_CONFIG = {
  API_URL: process.env.API_URL || 'https://your-render-app.onrender.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://your-netlify-app.netlify.app'
};

console.log('🚀 URLzy Production Verification Script');
console.log('=====================================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyHealthCheck() {
  log('🔍 Testing Health Check Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.API_URL}/health`);
    if (response.status === 200 && response.data.success) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${response.data.message}`);
      log(`   Environment: ${response.data.environment}`);
      log(`   Database: ${response.data.checks?.database?.status || 'unknown'}`);
      log(`   Email: ${response.data.checks?.email?.status || 'unknown'}`);
    } else {
      log('❌ Health check failed', 'red');
      log(`   Status: ${response.status}`);
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
  }
  console.log('');
}

async function verifyCORS() {
  log('🔍 Testing CORS Configuration...', 'blue');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.API_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': PRODUCTION_CONFIG.FRONTEND_URL,
        'Access-Control-Request-Method': 'POST'
      }
    });

    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders && (corsHeaders === '*' || corsHeaders.includes(new URL(PRODUCTION_CONFIG.FRONTEND_URL).origin))) {
      log('✅ CORS configuration looks good', 'green');
    } else {
      log('⚠️  CORS headers not found - verify configuration', 'yellow');
    }
  } catch (error) {
    log(`❌ CORS test error: ${error.message}`, 'red');
  }
  console.log('');
}

async function verifySecurityHeaders() {
  log('🔍 Testing Security Headers...', 'blue');
  try {
    const response = await makeRequest(`${PRODUCTION_CONFIG.API_URL}/health`);

    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    let securityScore = 0;
    securityHeaders.forEach(header => {
      if (response.headers[header]) {
        securityScore++;
        log(`✅ ${header}: ${response.headers[header]}`, 'green');
      } else {
        log(`⚠️  Missing: ${header}`, 'yellow');
      }
    });

    if (securityScore >= 3) {
      log(`✅ Security headers: ${securityScore}/${securityHeaders.length} configured`, 'green');
    } else {
      log(`⚠️  Security headers: ${securityScore}/${securityHeaders.length} configured`, 'yellow');
    }
  } catch (error) {
    log(`❌ Security headers test error: ${error.message}`, 'red');
  }
  console.log('');
}

async function verifyAPIEndpoints() {
  log('🔍 Testing API Endpoints...', 'blue');

  const endpoints = [
    { path: '/health', method: 'GET', description: 'Health Check' },
    { path: '/health/detailed', method: 'GET', description: 'Detailed Health' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${PRODUCTION_CONFIG.API_URL}${endpoint.path}`);
      if (response.status === 200) {
        log(`✅ ${endpoint.description}: ${response.status}`, 'green');
      } else {
        log(`⚠️  ${endpoint.description}: ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${endpoint.description}: ${error.message}`, 'red');
    }
  }
  console.log('');
}

async function main() {
  log(`🔗 API URL: ${PRODUCTION_CONFIG.API_URL}`);
  log(`🌐 Frontend URL: ${PRODUCTION_CONFIG.FRONTEND_URL}\n`);

  await verifyHealthCheck();
  await verifyCORS();
  await verifySecurityHeaders();
  await verifyAPIEndpoints();

  log('🎯 Production Verification Complete!', 'blue');
  log('\n📝 Next Steps:');
  log('1. Test user registration and login');
  log('2. Test URL shortening functionality');
  log('3. Verify email notifications');
  log('4. Monitor server logs for errors');
  log('5. Set up monitoring and alerts');

  log('\n📊 Health Check URLs:');
  log(`${PRODUCTION_CONFIG.API_URL}/health`);
  log(`${PRODUCTION_CONFIG.API_URL}/health/detailed`);
}

// Handle command line arguments
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
URLzy Production Verification Script

Usage:
  node verify-production.js [API_URL] [FRONTEND_URL]

Environment Variables:
  API_URL - Your Render API URL (default: https://your-render-app.onrender.com)
  FRONTEND_URL - Your Netlify frontend URL (default: https://your-netlify-app.netlify.app)

Examples:
  node verify-production.js
  API_URL=https://my-api.onrender.com FRONTEND_URL=https://my-app.netlify.app node verify-production.js
  node verify-production.js https://my-api.onrender.com https://my-app.netlify.app
`);
  process.exit(0);
}

// Allow command line arguments
if (process.argv[2]) {
  PRODUCTION_CONFIG.API_URL = process.argv[2];
}
if (process.argv[3]) {
  PRODUCTION_CONFIG.FRONTEND_URL = process.argv[3];
}

// Override with environment variables
if (process.env.API_URL) {
  PRODUCTION_CONFIG.API_URL = process.env.API_URL;
}
if (process.env.FRONTEND_URL) {
  PRODUCTION_CONFIG.FRONTEND_URL = process.env.FRONTEND_URL;
}

main().catch(error => {
  log(`💥 Script error: ${error.message}`, 'red');
  process.exit(1);
});