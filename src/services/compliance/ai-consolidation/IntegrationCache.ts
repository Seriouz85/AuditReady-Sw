/**
 * IntegrationCache.ts
 * Manages caching for AI integration results with TTL and statistics
 */

import { AIIntegrationResult } from './AIIntegrationService';

interface CacheEntry {
  fingerprint: string;
  result: AIIntegrationResult;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export class IntegrationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxEntries: number;
  private readonly maxAge: number; // milliseconds

  constructor(maxEntries: number = 100, maxAgeHours: number = 24) {
    this.maxEntries = maxEntries;
    this.maxAge = maxAgeHours * 60 * 60 * 1000;
  }

  /**
   * Get cached result if available and valid
   */
  get(fingerprint: string): AIIntegrationResult | null {
    const entry = this.cache.get(fingerprint);
    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.createdAt.getTime() > this.maxAge) {
      this.cache.delete(fingerprint);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();

    return { ...entry.result };
  }

  /**
   * Store result in cache
   */
  set(fingerprint: string, result: AIIntegrationResult): void {
    // Clean old entries if cache is getting large
    if (this.cache.size >= this.maxEntries) {
      this.cleanOldEntries();
    }

    this.cache.set(fingerprint, {
      fingerprint,
      result: { ...result },
      createdAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date()
    });
  }

  /**
   * Check if entry exists in cache
   */
  has(fingerprint: string): boolean {
    const entry = this.cache.get(fingerprint);
    if (!entry) {
      return false;
    }

    // Check if still valid
    if (Date.now() - entry.createdAt.getTime() > this.maxAge) {
      this.cache.delete(fingerprint);
      return false;
    }

    return true;
  }

  /**
   * Remove specific entry from cache
   */
  delete(fingerprint: string): boolean {
    return this.cache.delete(fingerprint);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean old entries when cache is full
   */
  private cleanOldEntries(): void {
    const oldestEntries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime())
      .slice(0, Math.floor(this.maxEntries / 2));
    
    oldestEntries.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt.getTime() > this.maxAge) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.cache.delete(key));
    return expired.length;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    if (this.cache.size === 0) {
      return {
        size: 0,
        hitRate: 0,
        oldestEntry: null,
        newestEntry: null,
        totalAccesses: 0,
        averageAccesses: 0
      };
    }

    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? Math.round((totalAccesses / this.cache.size) * 100) / 100 : 0,
      oldestEntry: entries.reduce((oldest, entry) => 
        entry.createdAt < oldest ? entry.createdAt : oldest, 
        new Date()
      ),
      newestEntry: entries.reduce((newest, entry) => 
        entry.createdAt > newest ? entry.createdAt : newest, 
        new Date(0)
      ),
      totalAccesses,
      averageAccesses: Math.round(totalAccesses / this.cache.size * 100) / 100
    };
  }

  /**
   * Get cache entries sorted by access count
   */
  getTopEntries(limit: number = 10) {
    return Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(([fingerprint, entry]) => ({
        fingerprint,
        accessCount: entry.accessCount,
        createdAt: entry.createdAt,
        lastAccessed: entry.lastAccessed,
        age: Date.now() - entry.createdAt.getTime()
      }));
  }

  /**
   * Get memory usage estimate in bytes
   */
  getMemoryUsage(): number {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      // Rough estimate of entry size
      totalSize += JSON.stringify(entry).length * 2; // Unicode characters are 2 bytes
    }
    
    return totalSize;
  }
}