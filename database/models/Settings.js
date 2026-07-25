const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  prefix: { type: String, default: '.' },
  welcomeEnabled: { type: Boolean, default: true },
  goodbyeEnabled: { type: Boolean, default: true },
  antiLink: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: false },
  maxWarnings: { type: Number, default: 3 },
  ownerContact: String,
  supportChannel: String,
  botName: { type: String, default: 'V!PER MD' },
  botImage: { type: String, default: 'https://i.ibb.co/G4z2SQ4M/160640.png' },
  footer: { type: String, default: '© 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝚂𝙰𝚂𝙰 𝙳𝙴𝚅\n🙈 𝙲𝙾𝙽𝙽𝙴𝙲𝚃 𝚅!𝙿𝙴𝚁 𝙼𝙳 :- https://vipermd.sasatech.online\nSupport Channel: https://whatsapp.com/channel/0029Vb86hKVJUM2SYD2qNw3K' },
});
module.exports = mongoose.model('Settings', settingsSchema);