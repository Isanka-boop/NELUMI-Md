const { startSocket, getConnectionStatus, reconnect, getSock } = require('../lib/baileysConnection');

exports.getStatus = (req, res) => {
  const s = getConnectionStatus();
  res.json({ status: s.status, qrAvailable: s.status === 'qr_ready', pairingCode: s.pairingCode || null });
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
    await startSocket({ usePairingCode: true, phoneNumber: cleanPhone });
    let attempts = 0;
    const interval = setInterval(() => {
      const s = getConnectionStatus();
      if (s.status === 'pairing_code' && s.pairingCode) {
        clearInterval(interval);
        return res.json({ code: s.pairingCode });
      }
      if (s.status === 'open') {
        clearInterval(interval);
        return res.json({ success: true, message: 'Connected successfully' });
      }
      if (s.status === 'error') {
        clearInterval(interval);
        return res.status(500).json({ error: s.error || 'Pairing code request failed' });
      }
      if (attempts++ > 30) { clearInterval(interval); return res.status(500).json({ error: 'Timeout — server did not receive a code from WhatsApp' }); }
    }, 1000);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.reconnectBot = async (req, res) => {
  try { await reconnect(); res.json({ success: true, message: 'Reconnecting...' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
