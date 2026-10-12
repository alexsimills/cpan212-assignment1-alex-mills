
import { config } from '../config.js';

const entries = new Map();

let hits = 0;
let misses = 0;

export function getCache(key) {
  const entry = entries.get(key);

  if (!entry) {
    misses++;
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    entries.delete(key);
    misses++;
    return null;
  }

  hits++;
  return entry.value;
}

export function setCache(key, value) {
  entries.set(key, {
    value,
    expiresAt: Date.now() + config.cacheTtlSeconds * 1000
  });
}

export function getCacheStats() {
  for (const [key, entry] of entries) {
    if (Date.now() >= entry.expiresAt) {
      entries.delete(key);
    }
  }

  return {
    hits,
    misses,
    ttlSeconds: config.cacheTtlSeconds,
    entries: entries.size
  };
}
