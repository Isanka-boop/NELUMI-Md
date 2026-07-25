const axios = require('axios');
const fetchJson = async (url, options) => { const { data } = await axios.get(url, options); return data; };
module.exports = { fetchJson };
