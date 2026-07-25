const { startSocket, getConnectionStatus, reconnect, getSock } = require('../lib/baileysConnection');

exports.getStatus = (req, res) => {
  const s = getConnectionStatus();
  res.json({ status: s.status, qrAvailable: s.status === 'qr_ready', pairingCode: s.pairingCode || null, error: s.error || null });
};

exports.getQR = (req, res) => {
  const s = getConnectionStatus();
  if (s.status === 'qr_ready' && s.qr) return res.json({ qr: s.qr });
  res.status(404).json({ error: 'QR not available' });
};

exports.pairNumber = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (cleanPhone.length < 8) {
    return res.status(400).json({ error: 'Enter number with country code, digits only (e.g. 94771234567)' });
  }
  const sock = getSock();
  if (sock) sock.end();
  try {
    // Kick off the connection but DON'T block the HTTP response on it —
    // Heroku's router kills any request open longer than 30s (H12) and
    // returns an HTML error page, which breaks the frontend's res.json().
    // The frontend polls /api/status (which already exposes pairingCode)
    // to pick up the code as soon as it's ready.
    await startSocket({ usePairingCode: true, phoneNumber: cleanPhone });
    res.json({ status: 'requesting', message: 'Requesting pairing code — polling status.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.reconnectBot = async (req, res) => {
  try { await reconnect(); res.json({ success: true, message: 'Reconnecting...' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
