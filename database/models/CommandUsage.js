const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  command: String,
  category: String,
  userJid: String,
  groupJid: String,
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model('CommandUsage', schema);