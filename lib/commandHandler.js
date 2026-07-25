const config = require('../config');
const logger = require('./logger');
const Settings = require('../database/models/Settings');
const CommandUsage = require('../database/models/CommandUsage');
const cooldowns = new Map();

let commandsArray = [];
const initCommands = async () => {
  try {
    commandsArray = require('../commands/index');
    logger.info(`Loaded ${commandsArray.length} commands`);
  } catch (err) { logger.error('Command load error:', err); }
};

const handleMessage = async (sock, msg) => {
  try {
    const { key, message } = msg;
    if (!message || key.fromMe) return;
    const jid = key.remoteJid;
    const sender = key.participant || jid;
    const isGroup = jid.endsWith('@g.us');

    const settings = await Settings.findById('global') || {};
    const prefix = settings.prefix || config.PREFIX;
    const body = message.conversation || message.extendedTextMessage?.text || '';
    if (!body) return;

    const isPrefixed = body.startsWith(prefix);
    let command, args;
    if (isPrefixed) {
      const split = body.slice(prefix.length).trim().split(/ +/);
      command = split.shift().toLowerCase();
      args = split;
    } else {
      const noPrefixCmd = commandsArray.find(cmd => cmd.noPrefix && body.toLowerCase().startsWith(cmd.name));
      if (!noPrefixCmd) return;
      command = noPrefixCmd.name;
      args = body.slice(command.length).trim().split(/ +/).filter(Boolean);
    }

    const cmd = commandsArray.find(c => c.name === command || (c.aliases && c.aliases.includes(command)));
    if (!cmd) return;

    // Owner check
    if (cmd.isOwner && !config.ADMIN_NUMBERS.includes(sender.split('@')[0]) && sender !== config.OWNER_NUMBER) {
      return sock.sendMessage(jid, { text: '❌ Owner only command.' });
    }
    // Admin check (in group)
    if (cmd.isAdmin && isGroup) {
      const meta = await sock.groupMetadata(jid);
      const part = meta.participants.find(p => p.id === sender);
      if (!part || !part.admin) return sock.sendMessage(jid, { text: '❌ Admin only command.' });
    }
    if (cmd.isGroup && !isGroup) return sock.sendMessage(jid, { text: '❌ Group only command.' });

    const cooldownTime = cmd.cooldown || 3000;
    const last = cooldowns.get(`${sender}-${command}`);
    if (last && Date.now() - last < cooldownTime) {
      return sock.sendMessage(jid, { text: '⏳ Please wait before using this command again.' });
    }
    cooldowns.set(`${sender}-${command}`, Date.now());

    await cmd.run({ sock, msg, m: msg, args, prefix, command, isGroup, sender, jid, isOwner: config.ADMIN_NUMBERS.includes(sender.split('@')[0]) });

    new CommandUsage({ command, category: cmd.category, userJid: sender, groupJid: isGroup ? jid : null }).save().catch(() => {});
  } catch (err) { logger.error('Handler error:', err); }
};

module.exports = { handleMessage, initCommands, getCommands: () => commandsArray };