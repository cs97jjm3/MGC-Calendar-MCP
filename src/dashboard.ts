/**
 * MGC Calendar Dashboard Server
 * 
 * Simple HTTP server that serves the dashboard HTML and provides REST API for event management.
 * Runs on port 3737 and provides full CRUD operations for calendar events.
 * 
 * API Endpoints:
 * - GET /api/events - List all events
 * - GET /api/events/:id - Get single event
 * - POST /api/events - Create event
 * - PUT /api/events/:id - Update event  
 * - DELETE /api/events/:id - Delete event
 * - POST /api/events/:id/publish - Mark event as published
 * - POST /api/import - Import events from ICS or JSON
 * - GET /api/export?format=json|ics - Export all events
 * - GET / - Serve dashboard HTML
 * 
 * No authentication required - this is a local-only server.
 * 
 * Author: James Murrell (MGC)
 * License: MIT
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { listEvents, createEvent, updateEvent, deleteEvent, getEvent, markAsPublished, importEvents, exportEvents, ensureDb, suggestTags } from './database.js';
import { generateICS, parseICS } from './ics-generator.js';
import type { CreateEventInput, CalendarEvent } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3737;

/**
 * Generate a combined ICS file from multiple events
 * Handles regeneration of missing ICS files automatically
 */
function generateCombinedICS(events: CalendarEvent[]): string {
  const icsDir = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.mgc-calendar', 'ics-files');
  let combinedICS = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MGC Calendar//EN\r\nCALSCALE:GREGORIAN\r\n';
  
  events.forEach(event => {
    const icsPath = path.join(icsDir, `${event.uid}.ics`);
    
    // Regenerate ICS if it doesn't exist
    if (!fs.existsSync(icsPath)) {
      console.error(`Regenerating ICS for event ${event.id}`);
      try {
        generateICS(event);
      } catch (error) {
        console.error(`Failed to generate ICS for event ${event.id}:`, error);
      }
    }
    
    if (fs.existsSync(icsPath)) {
      const icsContent = fs.readFileSync(icsPath, 'utf-8');
      // Extract VEVENT section from each file
      const veventMatch = icsContent.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
      if (veventMatch) {
        combinedICS += veventMatch[0] + '\r\n';
      }
    }
  });
  
  combinedICS += 'END:VCALENDAR\r\n';
  return combinedICS;
}

function serveHTML(res: http.ServerResponse) {
  const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

function serveStaticFile(filepath: string, res: http.ServerResponse) {
  const dashboardDir = path.join(__dirname, '..', 'dashboard');
  const fullPath = path.normalize(path.join(dashboardDir, filepath));
  const normalizedDashboardDir = path.normalize(dashboardDir);
  
  console.error(`Static file request:`);
  console.error(`  filepath: ${filepath}`);
  console.error(`  dashboardDir: ${normalizedDashboardDir}`);
  console.error(`  fullPath: ${fullPath}`);
  console.error(`  exists: ${fs.existsSync(fullPath)}`);
  
  // Security: prevent directory traversal
  if (!fullPath.startsWith(normalizedDashboardDir)) {
  console.error(`  BLOCKED: Path traversal attempt`);
  res.writeHead(403);
  res.end('Forbidden');
  return;
  }
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
  console.error(`  ERROR: File not found`);
  res.writeHead(404);
  res.end(`Not found: ${filepath}`);
  return;
  }
  
  // Determine content type
  const ext = path.extname(fullPath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
  };
  
  const contentType = contentTypes[ext] || 'application/octet-stream';
  console.error(`  contentType: ${contentType}`);
  
  try {
    // Read and serve file
    const content = fs.readFileSync(fullPath);
    console.error(`  SUCCESS: Serving ${content.length} bytes`);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    console.error(`  ERROR: ${error}`);
    res.writeHead(500);
    res.end(`Error reading file: ${error}`);
  }
}

async function handleAPI(req: http.IncomingMessage, res: http.ServerResponse) {
  // Ensure database is initialized
  await ensureDb();
  
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/events - List all events
  if (req.method === 'GET' && url.pathname === '/api/events') {
    const events = listEvents();
    res.writeHead(200);
    res.end(JSON.stringify(events));
    return;
  }

  // GET /api/events/all/ics - Download all events as single ICS (MUST come before :id routes)
  if (req.method === 'GET' && url.pathname === '/api/events/all/ics') {
    const events = listEvents();
    if (events.length === 0) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'No events found' }));
      return;
    }

    const combinedICS = generateCombinedICS(events);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="mgc-calendar-all-events.ics"');
    res.writeHead(200);
    res.end(combinedICS);
    return;
  }

  // GET /api/events/:id - Get single event
  if (req.method === 'GET' && url.pathname.startsWith('/api/events/')) {
    const id = parseInt(url.pathname.split('/')[3]);
    const event = getEvent(id);
    if (event) {
      res.writeHead(200);
      res.end(JSON.stringify(event));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Event not found' }));
    }
    return;
  }

  // POST /api/events - Create event
  if (req.method === 'POST' && url.pathname === '/api/events') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const input = JSON.parse(body) as CreateEventInput;
        const event = createEvent(input);
        generateICS(event);
        res.writeHead(201);
        res.end(JSON.stringify(event));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid input' }));
      }
    });
    return;
  }

  // PUT /api/events/:id - Update event
  if (req.method === 'PUT' && url.pathname.startsWith('/api/events/')) {
    const id = parseInt(url.pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const input = JSON.parse(body);
        const event = updateEvent({ id, ...input });
        if (event) {
          generateICS(event);
          res.writeHead(200);
          res.end(JSON.stringify(event));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Event not found' }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid input' }));
      }
    });
    return;
  }

  // DELETE /api/events/:id - Delete event
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/events/')) {
    const id = parseInt(url.pathname.split('/')[3]);
    const event = deleteEvent(id);
    if (event) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Event not found' }));
    }
    return;
  }

  // GET /api/events/:id/ics - Download single event ICS
  if (req.method === 'GET' && url.pathname.match(/\/api\/events\/\d+\/ics$/)) {
    const id = parseInt(url.pathname.split('/')[3]);
    const event = getEvent(id);
    if (event) {
      const icsPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.mgc-calendar', 'ics-files', `${event.uid}.ics`);
      
      // If ICS file doesn't exist, regenerate it
      if (!fs.existsSync(icsPath)) {
        console.error(`ICS file not found for event ${id}, regenerating...`);
        try {
          generateICS(event);
        } catch (error) {
          console.error('Failed to generate ICS:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to generate ICS file' }));
          return;
        }
      }
      
      if (fs.existsSync(icsPath)) {
        const icsContent = fs.readFileSync(icsPath, 'utf-8');
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="event-${id}.ics"`);
        res.writeHead(200);
        res.end(icsContent);
      } else {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to create ICS file' }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Event not found' }));
    }
    return;
  }



  // POST /api/events/:id/publish - Mark event as published
  if (req.method === 'POST' && url.pathname.match(/\/api\/events\/\d+\/publish$/)) {
    const id = parseInt(url.pathname.split('/')[3]);
    const event = markAsPublished(id);
    if (event) {
      res.writeHead(200);
      res.end(JSON.stringify(event));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Event not found' }));
    }
    return;
  }

  // POST /api/import - Import events
  if (req.method === 'POST' && url.pathname === '/api/import') {
    let body = '';
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const content = buffer.toString('utf-8');
        
        // Detect format
        let events: any[] = [];
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          // JSON format
          const parsed = JSON.parse(content);
          events = Array.isArray(parsed) ? parsed : [parsed];
        } else if (content.includes('BEGIN:VCALENDAR')) {
          // ICS format
          events = parseICS(content);
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Unsupported format. Use JSON or ICS.' }));
          return;
        }
        
        const result = importEvents(events);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: `Import failed: ${error}` }));
      }
    });
    return;
  }

  // GET /api/export - Export events
  if (req.method === 'GET' && url.pathname === '/api/export') {
    const format = url.searchParams.get('format') || 'json';
    const events = exportEvents();
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="mgc-calendar-export.json"');
      res.writeHead(200);
      res.end(JSON.stringify(events, null, 2));
    } else if (format === 'ics') {
      const combinedICS = generateCombinedICS(events);
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="mgc-calendar-export.ics"');
      res.writeHead(200);
      res.end(combinedICS);
    } else {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid format. Use json or ics.' }));
    }
    return;
  }

  // POST /api/suggest-tags - Suggest tags based on title and description
  if (req.method === 'POST' && url.pathname === '/api/suggest-tags') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { title, description } = JSON.parse(body);
        const suggestions = suggestTags(title || '', description || '');
        res.writeHead(200);
        res.end(JSON.stringify({ tags: suggestions }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid input' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  
  console.error(`Request: ${req.method} ${url.pathname}`);
  
  if (url.pathname.startsWith('/api/')) {
    await handleAPI(req, res);
  } else if (url.pathname === '/') {
    serveHTML(res);
  } else {
    // Serve static files (images, css, js, etc.)
    console.error(`Attempting to serve static file: ${url.pathname}`);
    serveStaticFile(url.pathname, res);
  }
});

// Initialize database before starting server
async function startServer() {
  try {
    await ensureDb();
    console.error('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
  
  server.listen(PORT, () => {
    console.error(`MGC Calendar Dashboard running at http://localhost:${PORT}`);
    console.error('Press Ctrl+C to stop');
  });
}

startServer();
