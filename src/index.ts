#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z, ZodError } from 'zod';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as db from './database.js';
import { generateICS, getOutputDirectory } from './ics-generator.js';

const server = new Server(
  {
    name: 'mgc-calendar-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  try {
    switch (name) {
      case 'create_event': {
        const input = CreateEventSchema.parse(args);
        const event = db.createEvent(input);
        const icsPath = generateICS(event);
        
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
        const event = db.getEvent(id);
        
        if (!event) {
          return {
            content: [
              {
                type: 'text',
                text: `Event with ID ${id} not found.`,
              },
            ],
          };
        }

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
        const event = db.updateEvent(input);
        
        if (!event) {
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
        const event = db.deleteEvent(id);
        
        if (!event) {
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
        try {
          // Spawn the dashboard server
          const dashboardProcess = spawn('node', [__dirname + '/dashboard.js'], {
            detached: true,
            stdio: 'ignore'
          });
          dashboardProcess.unref();

          // Open browser after a short delay
          setTimeout(() => {
            const url = 'http://localhost:3737';
            const start = process.platform === 'darwin' ? 'open' :
                         process.platform === 'win32' ? 'start' : 'xdg-open';
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
          return {
            content: [
              {
                type: 'text',
                text: `Failed to launch dashboard: ${error}\n\nYou can manually start it with: npm run dashboard`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid arguments: ${errorMessages}`);
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MGC Calendar MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
