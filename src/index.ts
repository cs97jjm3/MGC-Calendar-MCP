#!/usr/bin/env node

/**
 * MGC Calendar MCP Server v1.0.1
 * 
 * Model Context Protocol server that provides calendar management tools to Claude.
 * Uses ICS files for universal compatibility - works with any calendar app.
 * No OAuth, no API keys, no authentication required.
 * 
 * Tools provided:
 * - create_event: Create new calendar events
 * - list_events: List all tracked events
 * - get_event: Get details of specific event
 * - update_event: Update existing events
 * - delete_event: Delete events (generates cancellation ICS)
 * - launch_dashboard: Open web dashboard on port 3737
 * 
 * Data storage:
 * - SQLite database: ~/.mgc-calendar/events.db
 * - ICS files: ~/.mgc-calendar/ics-files/
 * 
 * Author: James Murrell (MGC)
 * License: MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z, ZodError } from 'zod';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as db from './database.js';
import { generateICS, getOutputDirectory } from './ics-generator.js';

// Logging utility
function log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.error(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.error(logMessage);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verify installation on startup
function verifyInstallation() {
  log('INFO', 'MGC Calendar MCP Server starting...');
  log('INFO', `Node version: ${process.version}`);
  log('INFO', `Platform: ${process.platform}`);
  log('INFO', `Architecture: ${process.arch}`);
  log('INFO', `Working directory: ${process.cwd()}`);
  log('INFO', `Server directory: ${__dirname}`);
  
  // Check if database directory exists
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  const dbDir = join(homeDir, '.mgc-calendar');
  const icsDir = join(dbDir, 'ics-files');
  
  log('INFO', `Database directory: ${dbDir}`);
  
  if (!existsSync(dbDir)) {
    log('INFO', 'Creating database directory...');
    try {
      mkdirSync(dbDir, { recursive: true });
      log('INFO', 'Database directory created successfully');
    } catch (error) {
      log('ERROR', 'Failed to create database directory', error);
    }
  } else {
    log('INFO', 'Database directory exists');
  }
  
  if (!existsSync(icsDir)) {
    log('INFO', 'Creating ICS files directory...');
    try {
      mkdirSync(icsDir, { recursive: true });
      log('INFO', 'ICS files directory created successfully');
    } catch (error) {
      log('ERROR', 'Failed to create ICS files directory', error);
    }
  } else {
    log('INFO', 'ICS files directory exists');
  }
  
  // Check if dashboard file exists
  const dashboardPath = join(__dirname, 'dashboard.js');
  if (existsSync(dashboardPath)) {
    log('INFO', `Dashboard found at: ${dashboardPath}`);
  } else {
    log('WARN', `Dashboard not found at: ${dashboardPath}`);
  }
}

verifyInstallation();

const server = new Server(
  {
    name: 'mgc-calendar-mcp',
    version: '1.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas
const CreateEventSchema = z.object({
  title: z.string().describe('Event title'),
  description: z.string().optional().describe('Event description'),
  location: z.string().optional().describe('Event location'),
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  startTime: z.string().optional().describe('Start time in HH:MM format (24-hour)'),
  endDate: z.string().optional().describe('End date in YYYY-MM-DD format (defaults to start date)'),
  endTime: z.string().optional().describe('End time in HH:MM format (24-hour)'),
  allDay: z.boolean().optional().describe('Whether this is an all-day event'),
});

const UpdateEventSchema = z.object({
  id: z.number().describe('Event ID'),
  title: z.string().optional().describe('Event title'),
  description: z.string().optional().describe('Event description'),
  location: z.string().optional().describe('Event location'),
  startDate: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  startTime: z.string().optional().describe('Start time in HH:MM format (24-hour)'),
  endDate: z.string().optional().describe('End date in YYYY-MM-DD format'),
  endTime: z.string().optional().describe('End time in HH:MM format (24-hour)'),
  allDay: z.boolean().optional().describe('Whether this is an all-day event'),
});

const GetEventSchema = z.object({
  id: z.number().describe('Event ID'),
});

const DeleteEventSchema = z.object({
  id: z.number().describe('Event ID'),
});

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('INFO', 'Tools list requested');
  return {
    tools: [
      {
        name: 'create_event',
        description: 'Create a new calendar event. Generates an ICS file that can be imported into any calendar application.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Event title' },
            description: { type: 'string', description: 'Event description' },
            location: { type: 'string', description: 'Event location' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            startTime: { type: 'string', description: 'Start time in HH:MM format (24-hour)' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format (defaults to start date)' },
            endTime: { type: 'string', description: 'End time in HH:MM format (24-hour)' },
            allDay: { type: 'boolean', description: 'Whether this is an all-day event' },
          },
          required: ['title', 'startDate'],
        },
      },
      {
        name: 'list_events',
        description: 'List all tracked calendar events',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_event',
        description: 'Get details of a specific event by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Event ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_event',
        description: 'Update an existing event. Generates a new ICS file with updated information.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Event ID' },
            title: { type: 'string', description: 'Event title' },
            description: { type: 'string', description: 'Event description' },
            location: { type: 'string', description: 'Event location' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            startTime: { type: 'string', description: 'Start time in HH:MM format (24-hour)' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
            endTime: { type: 'string', description: 'End time in HH:MM format (24-hour)' },
            allDay: { type: 'boolean', description: 'Whether this is an all-day event' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_event',
        description: 'Delete an event. Generates a cancellation ICS file.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Event ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'launch_dashboard',
        description: 'Launch the MGC Calendar web dashboard at http://localhost:3737. Opens browser with calendar views, content editor, and LinkedIn posting features.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  log('INFO', `Tool called: ${name}`, args);

  try {
    switch (name) {
      case 'create_event': {
        const input = CreateEventSchema.parse(args);
        log('DEBUG', 'Creating event', input);
        
        const event = db.createEvent(input);
        log('INFO', `Event created with ID: ${event.id}`);
        
        const icsPath = generateICS(event);
        log('INFO', `ICS file generated: ${icsPath}`);
        
        return {
          content: [
            {
              type: 'text',
              text: `Event created successfully!\n\nEvent ID: ${event.id}\nTitle: ${event.title}\nDate: ${event.startDate}${event.startTime ? ` at ${event.startTime}` : ''}\n\nICS file saved to: ${icsPath}\n\nTo add this event to your calendar:\n1. Open the ICS file in your file manager\n2. Double-click to import it into your default calendar app\n3. Or manually import it in Google Calendar, Outlook, Apple Calendar, etc.`,
            },
          ],
        };
      }

      case 'list_events': {
        const events = db.listEvents();
        log('INFO', `Found ${events.length} events`);
        
        if (events.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No events found.',
              },
            ],
          };
        }

        const eventList = events.map(e => 
          `ID: ${e.id} | ${e.title} | ${e.startDate}${e.startTime ? ` ${e.startTime}` : ''}`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${events.length} event(s):\n\n${eventList}\n\nICS files location: ${getOutputDirectory()}`,
            },
          ],
        };
      }

      case 'get_event': {
        const { id } = GetEventSchema.parse(args);
        log('DEBUG', `Getting event ID: ${id}`);
        
        const event = db.getEvent(id);
        
        if (!event) {
          log('WARN', `Event not found: ${id}`);
          return {
            content: [
              {
                type: 'text',
                text: `Event with ID ${id} not found.`,
              },
            ],
          };
        }

        log('INFO', `Event retrieved: ${event.title}`);
        return {
          content: [
            {
              type: 'text',
              text: `Event Details:\n\nID: ${event.id}\nTitle: ${event.title}\nDescription: ${event.description || 'N/A'}\nLocation: ${event.location || 'N/A'}\nStart: ${event.startDate}${event.startTime ? ` ${event.startTime}` : ''}\nEnd: ${event.endDate}${event.endTime ? ` ${event.endTime}` : ''}\nAll Day: ${event.allDay ? 'Yes' : 'No'}\nCreated: ${event.createdAt}\nUpdated: ${event.updatedAt}`,
            },
          ],
        };
      }

      case 'update_event': {
        const input = UpdateEventSchema.parse(args);
        log('DEBUG', 'Updating event', input);
        
        const event = db.updateEvent(input);
        
        if (!event) {
          log('WARN', `Event not found for update: ${input.id}`);
          return {
            content: [
              {
                type: 'text',
                text: `Event with ID ${input.id} not found.`,
              },
            ],
          };
        }

        const icsPath = generateICS(event);
        log('INFO', `Event updated: ${event.id}, ICS: ${icsPath}`);
        
        return {
          content: [
            {
              type: 'text',
              text: `Event updated successfully!\n\nEvent ID: ${event.id}\nTitle: ${event.title}\nDate: ${event.startDate}${event.startTime ? ` at ${event.startTime}` : ''}\n\nUpdated ICS file saved to: ${icsPath}\n\nTo update this event in your calendar:\n1. Open the updated ICS file\n2. Import it - most calendar apps will recognize the UID and update the existing event`,
            },
          ],
        };
      }

      case 'delete_event': {
        const { id } = DeleteEventSchema.parse(args);
        log('DEBUG', `Deleting event ID: ${id}`);
        
        const event = db.deleteEvent(id);
        
        if (!event) {
          log('WARN', `Event not found for deletion: ${id}`);
          return {
            content: [
              {
                type: 'text',
                text: `Event with ID ${id} not found.`,
              },
            ],
          };
        }

        const icsPath = generateICS(event, 'CANCELLED');
        log('INFO', `Event deleted: ${id}, Cancellation ICS: ${icsPath}`);
        
        return {
          content: [
            {
              type: 'text',
              text: `Event deleted successfully!\n\nEvent ID: ${event.id}\nTitle: ${event.title}\n\nCancellation ICS file saved to: ${icsPath}\n\nTo remove this event from your calendar:\n1. Open the cancellation ICS file\n2. Import it - most calendar apps will recognize the UID and remove the event`,
            },
          ],
        };
      }

      case 'launch_dashboard': {
        log('INFO', 'Launching dashboard...');
        try {
          const dashboardPath = join(__dirname, 'dashboard.js');
          
          if (!existsSync(dashboardPath)) {
            log('ERROR', `Dashboard file not found: ${dashboardPath}`);
            return {
              content: [
                {
                  type: 'text',
                  text: `Dashboard launch failed: dashboard.js not found at ${dashboardPath}\n\nPlease ensure the project is built correctly:\nnpm run build`,
                },
              ],
            };
          }
          
          log('DEBUG', `Spawning dashboard process: node ${dashboardPath}`);
          
          // Spawn the dashboard server
          const dashboardProcess = spawn('node', [dashboardPath], {
            detached: true,
            stdio: 'ignore'
          });
          dashboardProcess.unref();

          log('INFO', 'Dashboard process spawned');

          // Open browser after a short delay
          setTimeout(() => {
            const url = 'http://localhost:3737';
            const start = process.platform === 'darwin' ? 'open' :
                         process.platform === 'win32' ? 'start' : 'xdg-open';
            
            log('DEBUG', `Opening browser: ${start} ${url}`);
            spawn(start, [url], { shell: true });
          }, 1000);

          return {
            content: [
              {
                type: 'text',
                text: `MGC Calendar Dashboard launching...\n\nDashboard URL: http://localhost:3737\n\nOpening in your default browser.\n\nFeatures:\n- Month/Week/List calendar views\n- Article content editor\n- LinkedIn posting (copies content to clipboard)\n- Full CRUD operations\n\nTo stop the dashboard, close the browser tab and restart Claude Desktop.`,
              },
            ],
          };
        } catch (error) {
          log('ERROR', 'Dashboard launch failed', error);
          return {
            content: [
              {
                type: 'text',
                text: `Failed to launch dashboard: ${error}\n\nYou can manually start it with: npm run dashboard\n\nError details logged to stderr.`,
              },
            ],
          };
        }
      }

      default:
        log('ERROR', `Unknown tool called: ${name}`);
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      log('ERROR', 'Validation error', { issues: error.issues });
      throw new Error(`Invalid arguments: ${errorMessages}`);
    }
    log('ERROR', 'Tool execution error', error);
    throw error;
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log('INFO', 'MGC Calendar MCP server running on stdio');
    log('INFO', 'Server ready to receive tool calls');
  } catch (error) {
    log('ERROR', 'Failed to start server', error);
    throw error;
  }
}

main().catch((error) => {
  log('ERROR', 'Fatal error in main()', error);
  console.error('Fatal error:', error);
  process.exit(1);
});
