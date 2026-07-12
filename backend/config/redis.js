const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: () => {
          // Disable automatic reconnection to prevent error spam
          return false;
        }
      }
    });

    client.on('error', (err) => {
      // Silence Redis errors - app will work without caching
    });

    await client.connect();
    console.log('Redis Client Connected');
    return client;
  } catch (error) {
    // Silently fail - app will work without Redis
    console.log('Redis not available - continuing without caching');
    return null;
  }
};

const getCache = async (key) => {
  if (!client) return null;
  try {
    if (!client.isOpen) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

const setCache = async (key, data, expireInSeconds = 3600) => {
  if (!client) return;
  try {
    if (!client.isOpen) return;
    await client.setEx(key, expireInSeconds, JSON.stringify(data));
  } catch (error) {
    return;
  }
};

const deleteCache = async (key) => {
  if (!client) return;
  try {
    if (!client.isOpen) return;
    await client.del(key);
  } catch (error) {
    return;
  }
};

const deleteCachePattern = async (pattern) => {
  if (!client) return;
  try {
    if (!client.isOpen) return;
    const keys = await client.keys(pattern);
   if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    return;
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern
};
