import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store database in user's home directory
const dbPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.mgc-calendar', 'events.db');
const dbDir = path.dirname(dbPath);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    startTime TEXT DEFAULT '',
    endTime TEXT DEFAULT '',
    allDay INTEGER DEFAULT 0,
    content TEXT DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add content column if it doesn't exist (migration)
try {
  db.exec(`ALTER TABLE events ADD COLUMN content TEXT DEFAULT ''`);
} catch (e) {
  // Column already exists, ignore
}

export function generateUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `mgc-event-${timestamp}-${random}@mgc-calendar`;
}

export function createEvent(input: CreateEventInput): CalendarEvent {
  const uid = generateUID();
  const endDate = input.endDate || input.startDate;
  const endTime = input.endTime || input.startTime || '';
  const allDay = input.allDay ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO events (uid, title, description, location, startDate, endDate, startTime, endTime, allDay, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    uid,
    input.title,
    input.description || '',
    input.location || '',
    input.startDate,
    endDate,
    input.startTime || '',
    endTime,
    allDay,
    input.content || ''
  );

  return getEvent(result.lastInsertRowid as number)!;
}

export function getEvent(id: number): CalendarEvent | null {
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;

  return {
    ...row,
    allDay: row.allDay === 1
  };
}

export function listEvents(): CalendarEvent[] {
  const stmt = db.prepare('SELECT * FROM events ORDER BY startDate DESC, startTime DESC');
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    ...row,
    allDay: row.allDay === 1
  }));
}

export function updateEvent(input: UpdateEventInput): CalendarEvent | null {
  const existing = getEvent(input.id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    values.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.location !== undefined) {
    updates.push('location = ?');
    values.push(input.location);
  }
  if (input.startDate !== undefined) {
    updates.push('startDate = ?');
    values.push(input.startDate);
  }
  if (input.endDate !== undefined) {
    updates.push('endDate = ?');
    values.push(input.endDate);
  }
  if (input.startTime !== undefined) {
    updates.push('startTime = ?');
    values.push(input.startTime);
  }
  if (input.endTime !== undefined) {
    updates.push('endTime = ?');
    values.push(input.endTime);
  }
  if (input.allDay !== undefined) {
    updates.push('allDay = ?');
    values.push(input.allDay ? 1 : 0);
  }
  if (input.content !== undefined) {
    updates.push('content = ?');
    values.push(input.content);
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(input.id);

  const stmt = db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getEvent(input.id);
}

export function deleteEvent(id: number): CalendarEvent | null {
  const event = getEvent(id);
  if (!event) return null;

  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  stmt.run(id);

  return event;
}

export function closeDatabase(): void {
  db.close();
}
