import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
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

let db: SqlJsDatabase;
let SQL: any;

// Initialize sql.js
async function initDb() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Initialize database schema
  db.run(`
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
  
  saveDb();
}

// Save database to disk
function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, data);
  }
}

// Ensure database is initialized
let initPromise: Promise<void> | null = null;
async function ensureDb() {
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
}

export function generateUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `mgc-event-${timestamp}-${random}@mgc-calendar`;
}

export function createEvent(input: CreateEventInput): CalendarEvent {
  // sql.js is synchronous but we need to ensure it's initialized
  if (!db) {
    throw new Error('Database not initialized. Call ensureDb() first.');
  }
  
  const uid = generateUID();
  const endDate = input.endDate || input.startDate;
  const endTime = input.endTime || input.startTime || '';
  const allDay = input.allDay ? 1 : 0;

  db.run(
    `INSERT INTO events (uid, title, description, location, startDate, endDate, startTime, endTime, allDay, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid, input.title, input.description || '', input.location || '', input.startDate, endDate, input.startTime || '', endTime, allDay, input.content || '']
  );
  
  saveDb();

  const stmt = db.prepare('SELECT * FROM events WHERE uid = ?');
  stmt.bind([uid]);
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();

  return {
    ...row,
    allDay: row.allDay === 1
  } as CalendarEvent;
}

export function getEvent(id: number): CalendarEvent | null {
  if (!db) {
    throw new Error('Database not initialized. Call ensureDb() first.');
  }
  
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  stmt.bind([id]);
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      ...row,
      allDay: row.allDay === 1
    } as CalendarEvent;
  }
  
  stmt.free();
  return null;
}

export function listEvents(): CalendarEvent[] {
  if (!db) {
    throw new Error('Database not initialized. Call ensureDb() first.');
  }
  
  const stmt = db.prepare('SELECT * FROM events ORDER BY startDate DESC, startTime DESC');
  const results: CalendarEvent[] = [];
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      ...row,
      allDay: row.allDay === 1
    } as CalendarEvent);
  }
  
  stmt.free();
  return results;
}

export function updateEvent(input: UpdateEventInput): CalendarEvent | null {
  if (!db) {
    throw new Error('Database not initialized. Call ensureDb() first.');
  }
  
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

  db.run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDb();

  return getEvent(input.id);
}

export function deleteEvent(id: number): CalendarEvent | null {
  if (!db) {
    throw new Error('Database not initialized. Call ensureDb() first.');
  }
  
  const event = getEvent(id);
  if (!event) return null;

  db.run('DELETE FROM events WHERE id = ?', [id]);
  saveDb();

  return event;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}

// Export the initialization function
export { ensureDb };
