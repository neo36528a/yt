// ============================================================
// Ultra Video Downloader — URL Validator & Security
// ============================================================

import path from 'path';

/** Allowed URL protocols */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/** Characters that could be used for command injection */
const DANGEROUS_CHARS = /[;&|`$(){}[\]<>!#~'"\\]/g;

/**
 * Validate and sanitize a URL for safe processing.
 * Returns the sanitized URL string or throws an error.
 */
export function validateUrl(rawUrl: string): string {
  // Basic existence check
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL is required');
  }

  const trimmed = rawUrl.trim();

  // Length check
  if (trimmed.length > 2048) {
    throw new Error('URL is too long');
  }

  // Parse URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Protocol check
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }

  // Prevent localhost/internal network access
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Internal/local URLs are not allowed');
  }

  return parsed.toString();
}

/**
 * Sanitize a string to prevent command injection.
 * Used for any user input that might be passed to child processes.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(DANGEROUS_CHARS, '').trim();
}

/**
 * Sanitize a filename for safe filesystem usage.
 * Prevents directory traversal and removes dangerous characters.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'download';

  return filename
    // Remove path separators
    .replace(/[/\\]/g, '_')
    // Remove dangerous chars
    .replace(/[<>:"|?*\x00-\x1F]/g, '_')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove leading/trailing dots and underscores
    .replace(/^[._]+|[._]+$/g, '')
    // Collapse multiple underscores
    .replace(/_+/g, '_')
    // Limit length
    .substring(0, 200) || 'download';
}

/**
 * Validate that a file path stays within the allowed download directory.
 * Prevents directory traversal attacks.
 */
export function validateFilePath(filePath: string, baseDir: string): boolean {
  const resolved = path.resolve(filePath);
  const resolvedBase = path.resolve(baseDir);
  return resolved.startsWith(resolvedBase);
}

/**
 * Simple in-memory rate limiter.
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove expired timestamps
    const valid = timestamps.filter((t) => now - t < this.windowMs);

    if (valid.length >= this.maxRequests) {
      return false;
    }

    valid.push(now);
    this.requests.set(key, valid);
    return true;
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requests) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }
}

// Global rate limiter instance (100 requests per minute)
export const rateLimiter = new RateLimiter(100, 60000);

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}
