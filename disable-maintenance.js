#!/usr/bin/env node

/**
 * Emergency script to disable maintenance mode
 * Run this from the project root: node disable-maintenance.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server directory
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Import the Settings model
const Settings = require('./server/models/Settings');

async function disableMaintenanceMode() {
  try {
    console.log('🔧 Connecting to database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Connected to database');

    // Get current settings
    const settings = await Settings.getSettings();

    if (!settings.enableMaintenanceMode) {
      console.log('ℹ️  Maintenance mode is already disabled');
      process.exit(0);
    }

    // Disable maintenance mode
    await Settings.updateSettings({
      enableMaintenanceMode: false
    });

    console.log('✅ Maintenance mode has been disabled');
    console.log('🔄 Server will need to be restarted for changes to take effect');

  } catch (error) {
    console.error('❌ Error disabling maintenance mode:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
disableMaintenanceMode();