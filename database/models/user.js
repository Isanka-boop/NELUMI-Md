const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  name: String,
  role: { type: String, default: 'user' },
  banned: { type: Boolean, default: false },
  warnings: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastDaily: Date,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', userSchema);
