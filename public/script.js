const statusBadge = document.getElementById('statusBadge');
const qrSection = document.getElementById('qrSection');
const numberSection = document.getElementById('numberSection');
const success = document.getElementById('success');

// Poll status
setInterval(async () => {
  const res = await fetch('/api/status').then(r => r.json());
  statusBadge.textContent = res.status === 'open' ? 'Connected' : res.status;
  if (res.status === 'open') {
    success.style.display = 'block';
    qrSection.style.display = 'none';
    numberSection.style.display = 'none';
  }
}, 3000);

document.getElementById('btnQR').addEventListener('click', async () => {
  qrSection.style.display = 'block';
  numberSection.style.display = 'none';
  const res = await fetch('/api/qr').then(r => r.json());
  if (res.qr) {
    QRCode.toCanvas(document.getElementById('qrCanvas'), res.qr, { width: 250 });
  }
});

document.getElementById('btnNumber').addEventListener('click', () => {
  numberSection.style.display = 'block';
  qrSection.style.display = 'none';
});

document.getElementById('btnGetCode').addEventListener('click', async () => {
  const phone = document.getElementById('phoneInput').value;
  const res = await fetch('/api/pair-number', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone}) }).then(r=>r.json());
  if (res.code) {
    document.getElementById('pairingCode').innerText = `Your pairing code: ${res.code}`;
  }
});
