const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./database/mongo');
const apiRoutes = require('./routes/api');
const logger = require('./lib/logger');
const { startSocket, importSessionFromMongo } = require('./lib/baileysConnection');
const { initCommands, handleMessage } = require('./lib/commandHandler');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  logger.info(`Server on port ${PORT}`);
  await connectDB();
  await importSessionFromMongo();
  const sock = await startSocket();
  await initCommands();

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe) await handleMessage(sock, msg);
    }
  });
});