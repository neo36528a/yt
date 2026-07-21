// ============================================================
// Ultra Video Downloader — Database (SQLite)
// ============================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { HistoryItem, AppSettings, HistoryFilters, PaginatedResponse } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

let db: Database.Database | null = null;

/**
 * Get or create the SQLite database instance.
 */
function getDb(): Database.Database {
  if (db) return db;

  let dbPath = path.join(process.cwd(), 'data', 'ultra-downloader.db');
  let dataDir = path.dirname(dbPath);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    dbPath = path.join('/tmp', 'ultra-downloader.db');
  }

  try {
    db = new Database(dbPath);
  } catch {
    dbPath = path.join('/tmp', 'ultra-downloader.db');
    db = new Database(dbPath);
  }

  // Enable WAL mode for better concurrent access
  try {
    db.pragma('journal_mode = WAL');
  } catch {
    // Ignore WAL pragma error on restricted filesystems
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      website TEXT DEFAULT '',
      duration INTEGER DEFAULT 0,
      format TEXT DEFAULT 'mp4',
      resolution TEXT DEFAULT '1080p',
      fileSize INTEGER DEFAULT 0,
      filePath TEXT DEFAULT '',
      downloadedAt TEXT NOT NULL,
      status TEXT DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_history_date ON history(downloadedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_history_website ON history(website);
  `);

  return db;
}

// ---- History Operations ----

/**
 * Add a download to history.
 */
export function addHistoryItem(item: HistoryItem): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO history (id, url, title, thumbnail, website, duration, format, resolution, fileSize, filePath, downloadedAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    item.id,
    item.url,
    item.title,
    item.thumbnail,
    item.website,
    item.duration,
    item.format,
    item.resolution,
    item.fileSize,
    item.filePath,
    item.downloadedAt,
    item.status,
  );
}

/**
 * Get download history with filtering and pagination.
 */
export function getHistory(filters: HistoryFilters): PaginatedResponse<HistoryItem> {
  const db = getDb();

  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.search) {
    whereClause += ' AND (title LIKE ? OR url LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.website && filters.website !== 'all') {
    whereClause += ' AND website = ?';
    params.push(filters.website);
  }

  if (filters.resolution && filters.resolution !== 'all') {
    whereClause += ' AND resolution = ?';
    params.push(filters.resolution);
  }

  // Get total count
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM history ${whereClause}`);
  const { total } = countStmt.get(...params) as { total: number };

  // Sort
  const sortColumn = filters.sortBy === 'name' ? 'title' : filters.sortBy === 'size' ? 'fileSize' : 'downloadedAt';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = `ORDER BY ${sortColumn} ${sortOrder}`;

  // Pagination
  const offset = (filters.page - 1) * filters.limit;
  const limitClause = `LIMIT ? OFFSET ?`;

  const stmt = db.prepare(
    `SELECT * FROM history ${whereClause} ${orderClause} ${limitClause}`,
  );
  const items = stmt.all(...params, filters.limit, offset) as HistoryItem[];

  return {
    items,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit) || 1,
  };
}

/**
 * Delete a history item.
 */
export function deleteHistoryItem(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM history WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Clear all history.
 */
export function clearHistory(): void {
  const db = getDb();
  db.exec('DELETE FROM history');
}

/**
 * Check if a URL already exists in history (duplicate detection).
 */
export function isDuplicate(url: string): HistoryItem | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM history WHERE url = ? AND status = 'completed' LIMIT 1");
  return (stmt.get(url) as HistoryItem) || null;
}

// ---- Settings Operations ----

/**
 * Get all settings.
 */
export function getSettings(): AppSettings {
  const db = getDb();
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.value);
      (settings as Record<string, unknown>)[row.key] = parsed;
    } catch {
      // Skip invalid values
    }
  }

  return settings;
}

/**
 * Update settings.
 */
export function updateSettings(updates: Partial<AppSettings>): void {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(updates)) {
      stmt.run(key, JSON.stringify(value));
    }
  });

  transaction();

  // If cookiesText was updated, sync to data/cookies.txt
  if ('cookiesText' in updates) {
    try {
      const path = require('path');
      const fs = require('fs');
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const cookiesFilePath = path.join(dataDir, 'cookies.txt');
      if (updates.cookiesText && updates.cookiesText.trim()) {
        fs.writeFileSync(cookiesFilePath, updates.cookiesText.trim());
      } else if (fs.existsSync(cookiesFilePath)) {
        fs.unlinkSync(cookiesFilePath);
      }
    } catch {
      // Ignore file error
    }
  }
}
