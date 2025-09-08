const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  // Rate limiting settings
  rateLimitWindow: {
    type: Number,
    default: 15, // minutes
    min: 1,
    max: 1440
  },
  rateLimitMax: {
    type: Number,
    default: 100, // requests per window
    min: 1
  },

  // URL settings
  maxUrlLength: {
    type: Number,
    default: 2048,
    min: 10,
    max: 10000
  },
  defaultExpiryDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },

  // Analytics settings
  enableClickTracking: {
    type: Boolean,
    default: true
  },
  enableUserAnalytics: {
    type: Boolean,
    default: true
  },

  // Backup settings
  backupFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },

  // Logging settings
  logRetentionDays: {
    type: Number,
    default: 90,
    min: 1,
    max: 365
  },

  // Maintenance mode settings
  enableMaintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please try again later.',
    maxlength: 500
  }
}, {
  timestamps: true,
  // Ensure only one settings document exists
  collection: 'settings'
});

// Static method to get the single settings document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);