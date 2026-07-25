require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  OWNER_NUMBER: process.env.OWNER_NUMBER,
  PREFIX: process.env.PREFIX || '.',
  SESSION_ID: process.env.SESSION_ID || 'viper-md-session',
  ADMIN_NUMBERS: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [],
};