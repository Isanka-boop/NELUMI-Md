const router = require('express').Router();
const { getStatus, getQR, pairNumber, reconnectBot } = require('../controllers/botController');
router.get('/status', getStatus);
router.get('/qr', getQR);
router.post('/pair-number', pairNumber);
router.post('/reconnect', reconnectBot);
module.exports = router;
