const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../lib/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB error:', err);
    process.exit(1);
  }
}
module.exports = connectDB;