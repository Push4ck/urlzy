# Database Backup Strategy - URLzy

## Overview

This document outlines the backup strategy for the URLzy application's MongoDB database. Regular backups are crucial for data protection and disaster recovery.

## Backup Types

### 1. Automated Daily Backups
- **Frequency**: Daily at 2:00 AM UTC
- **Method**: `mongodump` via automated script
- **Compression**: Enabled
- **Retention**: 30 days
- **Storage**: Local filesystem with optional cloud sync

### 2. Manual Backups
- **Trigger**: On-demand via npm script
- **Use Case**: Before major deployments or data migrations
- **Storage**: Local with immediate cloud upload

### 3. Pre-Deployment Backups
- **Trigger**: Automatically before deployments
- **Retention**: 7 days
- **Purpose**: Quick rollback capability

## Backup Configuration

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/urlzy

# Optional
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
NODE_ENV=production
```

### Directory Structure

```
backups/
├── urlzy-backup-2024-01-15T02-00-00-000Z/
│   ├── urlzy/
│   │   ├── users.bson
│   │   ├── urls.bson
│   │   ├── clickevents.bson
│   │   └── ...
│   └── urlzy.metadata.json
└── urlzy-backup-2024-01-14T02-00-00-000Z/
    └── ...
```

## Usage

### Manual Backup

```bash
# Basic backup
npm run backup

# Compressed backup
npm run backup:compress

# Custom output directory
node scripts/backup.js --output /path/to/backups

# Help
node scripts/backup.js --help
```

### Automated Backup (Cron)

Add to crontab for daily backups:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/urlzy && npm run backup:compress
```

### Cloud Storage Integration

For cloud storage, consider these options:

1. **AWS S3**
   ```bash
   aws s3 sync ./backups s3://urlzy-backups/
   ```

2. **Google Cloud Storage**
   ```bash
   gsutil rsync -r ./backups gs://urlzy-backups/
   ```

3. **Azure Blob Storage**
   ```bash
   az storage blob upload-batch --destination backups --source ./backups
   ```

## Restore Procedures

### Full Database Restore

```bash
# Stop the application
npm stop

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/urlzy" ./backups/urlzy-backup-2024-01-15T02-00-00-000Z/urlzy

# Start the application
npm start
```

### Selective Collection Restore

```bash
# Restore only users collection
mongorestore --uri="mongodb://localhost:27017/urlzy" --collection=users ./backups/urlzy-backup-2024-01-15T02-00-00-000Z/urlzy/users.bson
```

### Point-in-Time Recovery

For more granular recovery, use MongoDB's oplog:

```bash
mongorestore --uri="mongodb://localhost:27017/urlzy" --oplogReplay ./backups/oplog-backup/
```

## Monitoring and Alerts

### Backup Success Monitoring

- Check backup script logs
- Verify backup file sizes
- Monitor disk space usage
- Set up alerts for backup failures

### Health Check Integration

The backup status can be monitored via:

```bash
curl http://localhost:5000/health/detailed
```

## Security Considerations

### Backup Encryption

```bash
# Encrypt backups
openssl enc -aes-256-cbc -salt -in backup.tar.gz -out backup.tar.gz.enc -k $BACKUP_ENCRYPTION_KEY

# Decrypt for restore
openssl enc -d -aes-256-cbc -in backup.tar.gz.enc -out backup.tar.gz -k $BACKUP_ENCRYPTION_KEY
```

### Access Control

- Restrict backup file access to administrators only
- Use separate credentials for backup operations
- Encrypt sensitive data in backups

## Disaster Recovery

### Recovery Time Objectives (RTO)
- **Critical Data**: 1 hour
- **Full System**: 4 hours
- **Complete Recovery**: 24 hours

### Recovery Point Objectives (RPO)
- **Maximum Data Loss**: 1 hour
- **Backup Frequency**: Every 24 hours

### Recovery Steps

1. **Assess the damage**
   - Identify affected systems
   - Determine data loss scope

2. **Execute recovery**
   - Restore from latest backup
   - Verify data integrity
   - Update DNS if needed

3. **Post-recovery tasks**
   - Test application functionality
   - Notify users of any data loss
   - Update monitoring systems

## Testing Backup and Recovery

### Regular Testing Schedule

- **Monthly**: Full backup and restore test
- **Quarterly**: Disaster recovery simulation
- **Annually**: Complete system recovery test

### Test Checklist

- [ ] Backup completes successfully
- [ ] Backup files are accessible
- [ ] Restore process works
- [ ] Application functions after restore
- [ ] Data integrity is maintained
- [ ] Performance is acceptable

## Maintenance

### Regular Tasks

- Monitor backup storage usage
- Clean up old backups automatically
- Update backup scripts as needed
- Test backup and recovery procedures
- Review and update this documentation

### Storage Requirements

- **Daily Backup Size**: ~50MB (estimate)
- **Monthly Storage**: ~1.5GB
- **Retention Period**: 30 days
- **Total Storage Needed**: ~45GB

## Contact Information

For backup-related issues or questions:

- **Technical Contact**: Development Team
- **Emergency Contact**: System Administrator
- **Documentation Updates**: This document should be reviewed quarterly

---

**Last Updated**: January 15, 2024
**Version**: 1.0