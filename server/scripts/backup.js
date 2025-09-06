#!/usr/bin/env node

/**
 * MongoDB Backup Script for URLzy
 *
 * This script creates backups of the MongoDB database using mongodump.
 * It supports both local and cloud MongoDB instances.
 *
 * Usage:
 *   node scripts/backup.js [options]
 *
 * Options:
 *   --env <environment>    Environment (development/production) - defaults to NODE_ENV
 *   --output <directory>   Output directory for backups - defaults to ./backups
 *   --compress             Compress the backup
 *   --help                 Show this help message
 *
 * Environment Variables:
 *   MONGODB_URI           MongoDB connection string
 *   BACKUP_RETENTION_DAYS Number of days to keep backups (default: 30)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class DatabaseBackup {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
    this.compress = false;
  }

  async createBackup(options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `urlzy-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }

    logger.info(`Starting database backup: ${backupName}`);

    const mongodumpCommand = this.buildMongodumpCommand(backupPath, options);

    return new Promise((resolve, reject) => {
      exec(mongodumpCommand, (error, stdout, stderr) => {
        if (error) {
          logger.error('Database backup failed', { error: error.message, stderr });
          reject(error);
          return;
        }

        logger.info('Database backup completed successfully', {
          backupPath,
          stdout: stdout.trim(),
          size: this.getDirectorySize(backupPath)
        });

        resolve({
          success: true,
          backupPath,
          backupName,
          timestamp,
          size: this.getDirectorySize(backupPath)
        });
      });
    });
  }

  buildMongodumpCommand(backupPath, options) {
    let command = `mongodump --uri="${this.mongoUri}" --out="${backupPath}"`;

    if (options.compress || this.compress) {
      command += ' --gzip';
    }

    // Add quiet flag to reduce output
    command += ' --quiet';

    return command;
  }

  async cleanupOldBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return;
    }

    const files = fs.readdirSync(this.backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.rmSync(filePath, { recursive: true, force: true });
        deletedCount++;
        logger.info(`Deleted old backup: ${file}`);
      }
    }

    if (deletedCount > 0) {
      logger.info(`Cleanup completed: ${deletedCount} old backups removed`);
    }
  }

  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return '0 MB';
    }

    let totalSize = 0;

    function calculateSize(itemPath) {
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const items = fs.readdirSync(itemPath);
        items.forEach(item => {
          calculateSize(path.join(itemPath, item));
        });
      } else {
        totalSize += stats.size;
      }
    }

    calculateSize(dirPath);
    return `${Math.round(totalSize / 1024 / 1024)} MB`;
  }

  async run(options = {}) {
    try {
      logger.info('Starting database backup process');

      // Create backup
      const result = await this.createBackup(options);

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info('Database backup process completed', result);
      return result;

    } catch (error) {
      logger.error('Database backup process failed', { error: error.message });
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--env':
        process.env.NODE_ENV = args[++i];
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      case '--compress':
        options.compress = true;
        break;
      case '--help':
        console.log(`
MongoDB Backup Script for URLzy

Usage:
  node scripts/backup.js [options]

Options:
  --env <environment>    Environment (development/production)
  --output <directory>   Output directory for backups
  --compress             Compress the backup
  --help                 Show this help message

Environment Variables:
  MONGODB_URI           MongoDB connection string (required)
  BACKUP_RETENTION_DAYS Number of days to keep backups (default: 30)
  BACKUP_DIR            Backup directory (default: ./backups)
        `);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  // Load environment variables
  require('dotenv').config();

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const backup = new DatabaseBackup();

  if (options.outputDir) {
    backup.backupDir = options.outputDir;
  }

  if (options.compress) {
    backup.compress = true;
  }

  try {
    await backup.run(options);
    console.log('✅ Database backup completed successfully');
  } catch (error) {
    console.error('❌ Database backup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseBackup;