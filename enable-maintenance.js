#!/usr/bin/env node

/**
 * Script to enable maintenance mode
 * Run this from the project root: node enable-maintenance.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server directory
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Import the Settings model
const Settings = require('./server/models/Settings');

async function enableMaintenanceMode() {
  try {
    console.log('🔧 Connecting to database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Connected to database');

    // Get current settings
    const settings = await Settings.getSettings();

    if (settings.enableMaintenanceMode) {
      console.log('ℹ️  Maintenance mode is already enabled');
      process.exit(0);
    }

    // Enable maintenance mode
    await Settings.updateSettings({
      enableMaintenanceMode: true,
      maintenanceMessage: 'System is under maintenance. Only administrators can log in at this time.'
    });

    console.log('✅ Maintenance mode has been enabled');
    console.log('🔄 Server will need to be restarted for changes to take effect');

  } catch (error) {
    console.error('❌ Error enabling maintenance mode:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
enableMaintenanceMode();