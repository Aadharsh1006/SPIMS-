const NodeCache = require('node-cache');

// Standard TTL: 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600 });

module.exports = cache;
