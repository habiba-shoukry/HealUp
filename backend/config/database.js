const mongoose = require('mongoose');

const userDB = mongoose.createConnection(process.env.MONGO_USER_DB_URL);
userDB.on('connected', () => console.log('✓ User DB connected (healup_users)'));
userDB.on('error', (err) => {
  console.error('✗ User DB connection error:', err.message);
  process.exit(1);
});

const activityDB = mongoose.createConnection(process.env.MONGO_ACTIVITY_DB_URL);
activityDB.on('connected', () => console.log('✓ Activity DB connected (healup_activity)'));
activityDB.on('error', (err) => {
  console.error('✗ Activity DB connection error:', err.message);
  process.exit(1);
});

// GridFS buckets for file storage
let userDBGridFSBucket = null;

userDB.once('open', () => {
  const GridFSBucket = require('mongodb').GridFSBucket;
  userDBGridFSBucket = new GridFSBucket(userDB.getClient().db(process.env.MONGO_USER_DB_NAME || 'healup_users'), {
    bucketName: 'avatarImages'
  });
});

module.exports = { userDB, activityDB, getUserGridFSBucket: () => userDBGridFSBucket };
