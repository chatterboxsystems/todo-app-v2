import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

let client = null;
let isConnecting = false;

export async function getRedisClient() {
  if (client && client.isOpen) {
    return client;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (client && client.isOpen) {
          clearInterval(checkConnection);
          resolve(client);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkConnection);
        reject(new Error('Connection timeout'));
      }, 10000);
    });
  }

  if (!REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  isConnecting = true;

  try {
    client = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    client.on('disconnect', () => {
      console.log('Redis disconnected');
    });

    await client.connect();
    isConnecting = false;
    return client;
  } catch (error) {
    isConnecting = false;
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function closeRedisConnection() {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}