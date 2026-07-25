const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const Session = require('../database/models/Session');
const logger = require('./logger');
const config = require('../config');

let sock = null;
let connectionState = { status: 'disconnected', qr: null, pairingCode: null };

// Export session to MongoDB (creds file)
const exportSessionToMongo = async () => {
  const sessionDir = path.join(__dirname, '..', 'sessions');
  const credsFile = path.join(sessionDir, 'creds.json');
  if (fs.existsSync(credsFile)) {
    const creds = JSON.parse(fs.readFileSync(credsFile));
    await Session.findOneAndUpdate({ _id: config.SESSION_ID }, { creds }, { upsert: true });
    logger.info('Session exported to MongoDB');
  }
};

// Import session from MongoDB if local file missing
const importSessionFromMongo = async () => {
  const sessionDir = path.join(__dirname, '..', 'sessions');
  const credsFile = path.join(sessionDir, 'creds.json');
  if (fs.existsSync(credsFile)) return false;
  const doc = await Session.findById(config.SESSION_ID);
  if (doc && doc.creds) {
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(credsFile, JSON.stringify(doc.creds));
    logger.info('Session imported from MongoDB');
    return true;
  }
  return false;
};

const startSocket = async (options = {}) => {
  const { usePairingCode, phoneNumber } = options;
  const sessionDir = path.join(__dirname, '..', 'sessions');
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const loggerBaileys = pino({ level: 'silent' });

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: loggerBaileys,
    mobile: usePairingCode ? true : false,
    pairingCode: usePairingCode ? true : false,
    browser: ['V!PER MD', 'Firefox', '1.0.0'],
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      connectionState = { ...connectionState, status: 'qr_ready', qr };
    }
    if (connection === 'connecting') {
      connectionState.status = 'connecting';
      if (usePairingCode && phoneNumber && sock) {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          connectionState = { ...connectionState, status: 'pairing_code', pairingCode: code, qr: null };
        } catch (e) { logger.error('Pairing code request failed'); }
      }
    } else if (connection === 'open') {
      connectionState = { status: 'open', qr: null, pairingCode: null };
      logger.info('WhatsApp connected');
      await exportSessionToMongo();
      await sock.sendPresenceUpdate('available');
    } else if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`Connection closed. Reconnect: ${shouldReconnect}`);
      connectionState.status = 'close';
      if (shouldReconnect) {
        startSocket(options);
      } else {
        connectionState.status = 'disconnected';
        logger.error('Logged out – please re‑pair');
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
  return sock;
};

const getConnectionStatus = () => connectionState;
const getSock = () => sock;
const reconnect = () => { if (sock) sock.end(); return startSocket(); };

module.exports = { startSocket, getConnectionStatus, getSock, reconnect, exportSessionToMongo, importSessionFromMongo };