const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  _id: String,
  creds: Object,
  keys: Object,
});
module.exports = mongoose.model('Session', sessionSchema);