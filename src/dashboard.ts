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
import { listEvents, createEvent, updateEvent, deleteEvent, getEvent } from './database.js';
import { generateICS } from './ics-generator.js';
import type { CreateEventInput } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3737;

function serveHTML(res: http.ServerResponse) {
  const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

function handleAPI(req: http.IncomingMessage, res: http.ServerResponse) {
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

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  
  if (url.pathname.startsWith('/api/')) {
    handleAPI(req, res);
  } else {
    serveHTML(res);
  }
});

server.listen(PORT, () => {
  console.log(`MGC Calendar Dashboard running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
