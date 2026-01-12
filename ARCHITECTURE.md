# MGC Calendar MCP - Architecture

This document explains the technical architecture and design decisions behind MGC Calendar MCP.

## Overview

MGC Calendar is a Model Context Protocol (MCP) server that manages calendar events using ICS files. It consists of four main components:

1. **MCP Server** - Provides tools to Claude Desktop
2. **SQLite Database** - Stores event data locally
3. **ICS Generator** - Creates standard calendar files
4. **Web Dashboard** - Visual interface for event management

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Desktop                        │
│                                                          │
│  User talks to Claude, Claude calls MCP tools           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ stdio (JSON-RPC)
                        │
┌───────────────────────▼─────────────────────────────────┐
│               MGC Calendar MCP Server                    │
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   index.ts │──│ database.ts │──│  SQLite DB  │     │
│  │ (MCP Tools)│  │             │  │ (events.db) │     │
│  └────────────┘  └─────────────┘  └─────────────┘     │
│         │                                               │
│         │         ┌─────────────┐                       │
│         └─────────│ics-generator│                       │
│                   │    .ts      │                       │
│                   └──────┬──────┘                       │
│                          │                              │
│                          ▼                              │
│                  ┌──────────────┐                       │
│                  │  ICS Files   │                       │
│                  │ (.ics format)│                       │
│                  └──────────────┘                       │
└──────────────────────────────────────────────────────────┘
                          │
                          │ HTTP (port 3737)
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    Web Dashboard                          │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Month   │  │   Week   │  │   List   │              │
│  │   View   │  │   View   │  │   View   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                           │
│  ┌────────────────────────────────────┐                 │
│  │      Content Editor & Stats         │                 │
│  └────────────────────────────────────┘                 │
└───────────────────────────────────────────────────────────┘
```

## Design Decisions

### Why ICS Files Instead of APIs?

**Problem:** Every calendar API requires OAuth setup, API keys, and platform-specific code.

**Solution:** Use ICS, the universal calendar standard.

**Benefits:**
- Works with any calendar app (Google, Outlook, Apple, etc.)
- No authentication required
- No rate limits
- No API deprecation risk
- Standard since 1998, will work forever

**Trade-off:** Users must manually import ICS files (we're working on auto-sync for v2.0)

### Why SQLite Instead of Cloud Storage?

**Decision:** Store all data locally in SQLite database.

**Reasons:**
1. **Privacy** - User data never leaves their machine
2. **Speed** - Local database is faster than network calls
3. **Reliability** - Works offline
4. **Simplicity** - No server setup required
5. **Zero Cost** - No cloud storage bills

**Location:** `~/.mgc-calendar/events.db`

**Schema:**
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT UNIQUE NOT NULL,           -- ICS UID for calendar sync
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  startDate TEXT NOT NULL,            -- YYYY-MM-DD format
  endDate TEXT NOT NULL,              -- YYYY-MM-DD format
  startTime TEXT DEFAULT '',          -- HH:MM format (24-hour)
  endTime TEXT DEFAULT '',            -- HH:MM format (24-hour)
  allDay INTEGER DEFAULT 0,           -- Boolean: 0 = false, 1 = true
  content TEXT DEFAULT '',            -- Article content for LinkedIn
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Why Custom UID Format?

**UID Format:** `mgc-event-{timestamp}-{random}@mgc-calendar`

**Example:** `mgc-event-1704987234567-k3j4h5@mgc-calendar`

**Purpose:** The UID is how calendar applications identify events across updates.

**How It Works:**
1. Create event → Generate ICS with new UID
2. Update event → Generate ICS with **same UID**
3. Calendar app sees matching UID → Updates existing event instead of creating duplicate
4. Delete event → Generate ICS with same UID + STATUS:CANCELLED

**Why the @domain part?**
- Required by RFC 5545 (iCalendar specification)
- Format must be `{unique-id}@{domain}`
- Domain doesn't need to be real - just needs to be unique to our system
- `@mgc-calendar` ensures our UIDs don't conflict with other systems

### Why No Express or Web Framework?

**Decision:** Use Node.js built-in HTTP server.

**Reasons:**
1. **Simplicity** - One less dependency to maintain
2. **Performance** - Built-in server is fast enough for local use
3. **Bundle Size** - Smaller installation
4. **Learning** - Makes code easier to understand

**Trade-off:** No middleware ecosystem, but we don't need it for this application.

### Why TypeScript?

**Decision:** Use TypeScript instead of plain JavaScript.

**Benefits:**
1. **Type Safety** - Catch errors at compile time
2. **IDE Support** - Better autocomplete and refactoring
3. **Documentation** - Types serve as inline documentation
4. **Maintainability** - Easier for contributors to understand

**Trade-off:** Requires compilation step, but `tsc` is fast and reliable.

## Data Flow

### Creating an Event

```
1. User talks to Claude: "Create event for Article 2 on Jan 22 at 2pm"
   │
   ▼
2. Claude calls create_event tool with parameters
   │
   ▼
3. index.ts receives tool call, validates with Zod
   │
   ▼
4. database.ts:
   - Generates unique UID
   - Inserts into SQLite
   - Returns event with ID
   │
   ▼
5. ics-generator.ts:
   - Creates ICS calendar object
   - Sets event properties
   - Sets UID (important!)
   - Writes to ~/.mgc-calendar/ics-files/
   │
   ▼
6. Returns file path to Claude
   │
   ▼
7. Claude tells user: "Event created, ICS file at: [path]"
```

### Updating an Event

```
1. User: "Update event 5 to start at 3pm"
   │
   ▼
2. database.ts:
   - Finds event by ID
   - Updates fields
   - Keeps same UID (critical!)
   - Updates updatedAt timestamp
   │
   ▼
3. ics-generator.ts:
   - Creates new ICS file
   - Uses **same UID** as original
   - Overwrites old ICS file
   │
   ▼
4. User imports updated ICS file
   │
   ▼
5. Calendar app sees matching UID → Updates event
```

### Dashboard Interaction

```
1. User asks Claude: "Launch the dashboard"
   │
   ▼
2. index.ts spawns dashboard.ts as separate process
   │
   ▼
3. dashboard.ts:
   - Starts HTTP server on port 3737
   - Serves index.html
   - Provides REST API
   │
   ▼
4. Browser opens http://localhost:3737
   │
   ▼
5. Dashboard HTML makes API calls:
   GET /api/events → List events
   POST /api/events → Create event
   PUT /api/events/:id → Update event
   DELETE /api/events/:id → Delete event
   │
   ▼
6. Each API call:
   - Modifies SQLite database
   - Generates/updates ICS files
   - Returns JSON response
```

## MCP Integration

### Tool Registration

When Claude Desktop starts the MCP server:

1. Server starts via stdio transport
2. Claude sends `tools/list` request
3. Server responds with 6 tool definitions:
   - create_event
   - list_events
   - get_event
   - update_event
   - delete_event
   - launch_dashboard

### Tool Invocation

When Claude calls a tool:

1. Claude sends `tools/call` request with tool name and arguments
2. Server validates arguments with Zod schemas
3. Server executes tool logic
4. Server returns response with content blocks
5. Claude incorporates response into conversation

### Error Handling

- Invalid arguments → ZodError → Detailed validation error
- Missing event → Returns "Event not found" message
- Database errors → Propagate to Claude with error message
- ICS generation errors → Caught and returned as error message

## Performance Considerations

### Database
- **SQLite is fast** - Local file access, no network latency
- **Indexes** - `id` is primary key (auto-indexed)
- **UID uniqueness** - Unique constraint prevents duplicates
- **No ORMs** - Direct SQL queries for speed

### ICS Generation
- **Small files** - ICS files are typically <1KB
- **Filesystem writes** - Fast on SSD storage
- **No caching needed** - Generation is fast enough

### Dashboard
- **Single-page app** - No page reloads
- **REST API** - Simple HTTP JSON endpoints
- **No database polling** - Client-side state management
- **Static HTML** - No build step required

## Security Considerations

### Local-Only Server
- Dashboard only binds to `localhost`
- Not accessible from network
- No CORS needed (same-origin)
- No authentication needed

### Data Storage
- SQLite database in user's home directory
- Only accessible to user running the application
- No cloud storage = no data breach risk
- No telemetry or analytics

### Input Validation
- Zod schemas validate all tool inputs
- SQL prepared statements prevent injection
- Date/time validation in database layer
- Character limits on text fields

## Testing Strategy

### Current State
- Manual testing via Claude Desktop
- Manual dashboard testing in browser
- Manual ICS import testing in calendar apps

### Planned (v1.1)
- Unit tests for database operations
- Integration tests for ICS generation
- API endpoint tests for dashboard
- End-to-end tests for MCP tools

### Test Framework
- Jest (planned) for unit/integration tests
- Supertest (planned) for API testing
- sqlite3 in-memory DB for test isolation

## Future Improvements

### v2.0: Auto-Sync
**Problem:** Manual ICS import is tedious

**Solution Options:**
1. **CalDAV integration** - Standard protocol, works with most servers
2. **Platform APIs** - Optional OAuth for Google/Microsoft
3. **File watcher** - Monitor calendar files and sync automatically

**Design principle:** Keep manual ICS as default, add auto-sync as optional.

### v2.0: Recurring Events
**Challenge:** ICS supports RRULE, but it's complex

**Approach:**
1. Extend database schema to store recurrence rules
2. Generate RRULE in ICS files
3. UI for configuring recurrence patterns
4. Handle exceptions (e.g., skipped occurrences)

## Technology Stack

### Runtime
- **Node.js 16+** - JavaScript runtime
- **TypeScript 5.7** - Type-safe language

### Dependencies
- **@modelcontextprotocol/sdk** - MCP protocol implementation
- **better-sqlite3** - SQLite bindings for Node.js
- **ical-generator** - ICS file generation
- **zod** - Schema validation

### Dev Dependencies
- **tsx** - TypeScript execution (development)
- **@types/node** - Node.js type definitions
- **@types/better-sqlite3** - SQLite type definitions

### Why These Choices?
- **better-sqlite3** - Fastest SQLite library for Node.js
- **ical-generator** - Well-maintained, supports full ICS spec
- **zod** - Best TypeScript validation library
- **No frontend framework** - Keep dashboard simple

## File System Layout

```
~/.mgc-calendar/              # User data directory
├── events.db                 # SQLite database
└── ics-files/                # Generated ICS files
    ├── mgc-event-123-abc@mgc-calendar.ics
    ├── mgc-event-456-def@mgc-calendar.ics
    └── ...

Project directory:
mgc-calendar-mcp/
├── src/                      # Source TypeScript files
│   ├── index.ts             # MCP server entry point
│   ├── database.ts          # SQLite operations
│   ├── ics-generator.ts     # ICS file generation
│   ├── dashboard.ts         # Web server
│   └── types.ts             # TypeScript types
├── dashboard/               # Frontend assets
│   ├── index.html          # Single-page dashboard
│   └── mgc-logo.svg        # Logo
├── build/                  # Compiled JavaScript (gitignored)
└── node_modules/           # Dependencies (gitignored)
```

## Questions?

If you have questions about the architecture or design decisions, open an issue on GitHub or check the README for contact information.

---

**Remember:** Every technical decision in MGC Calendar prioritizes simplicity over complexity. If OAuth takes 4 days and ICS takes 4 hours, we choose ICS every time.
