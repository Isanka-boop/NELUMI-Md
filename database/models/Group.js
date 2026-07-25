const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  name: String,
  welcome: { type: String, default: '' },
  goodbye: { type: String, default: '' },
  antiLink: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  blacklist: [String],
});
module.exports = mongoose.model('Group', groupSchema);