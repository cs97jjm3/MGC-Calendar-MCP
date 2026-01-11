# MGC Calendar MCP

Universal calendar manager for Claude using ICS files - **no OAuth required**.

## What it does

MGC Calendar Manager lets Claude create, update, and delete calendar events using standard ICS files. Works with **any calendar application** (Google Calendar, Outlook, Apple Calendar) without requiring API keys or OAuth setup.

- ✅ Create calendar events via conversation with Claude
- ✅ Track all events in local SQLite database  
- ✅ Generate standard ICS files for universal compatibility
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ No API keys, no OAuth, no cloud dependencies

## Installation

### Requirements
- Node.js 16 or higher
- Claude Desktop

### Setup

1. **Clone this repository:**
```bash
git clone https://github.com/cs97jjm3/mgc-calendar-mcp.git
cd mgc-calendar-mcp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Add to Claude Desktop:**

Edit your Claude Desktop config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add this configuration (replace with your actual path):

```json
{
  "mcpServers": {
    "mgc-calendar": {
      "command": "node",
      "args": ["/absolute/path/to/mgc-calendar-mcp/build/index.js"]
    }
  }
}
```

5. **Restart Claude Desktop**

## Usage

Once installed, you can ask Claude to manage your calendar:

**Create an event:**
```
"Create a calendar event for Article 2 writing session on January 22, 2025 at 2pm"
```

**List all events:**
```
"Show me all my calendar events"
```

**Update an event:**
```
"Update event ID 1 to start at 3pm instead"
```

**Delete an event:**
```
"Delete event ID 5"
```

All events are saved as ICS files in `~/.mgc-calendar/ics-files/` which you can import into any calendar application.

## Features

- **Universal compatibility**: Works with Google Calendar, Outlook, Apple Calendar, and any app that supports ICS files
- **No authentication hassle**: No OAuth flows, no API keys, no token management
- **Local-first**: All data stored locally in SQLite database
- **Proper UID tracking**: Events can be updated/cancelled across calendar apps
- **Simple**: Just works, no complex setup

## How it works

1. You ask Claude to create a calendar event
2. MGC Calendar generates an ICS file with a unique UID
3. Event is saved to local database for tracking
4. You import the ICS file into your calendar app
5. Updates and deletions generate new ICS files that calendar apps recognize

## File locations

- **Database**: `~/.mgc-calendar/events.db`
- **ICS files**: `~/.mgc-calendar/ics-files/`

## Tools

This MCP server exposes these tools to Claude:

- `create_event` - Create a new calendar event
- `list_events` - List all tracked events
- `get_event` - Get details of a specific event
- `update_event` - Update an existing event
- `delete_event` - Delete an event (generates cancellation ICS)

## Roadmap

**v1.1 (planned):**
- Icon
- Web-based dashboard for visual management
- Bulk import/export
- Calendar view

## Why MGC Calendar?

Most calendar MCP servers require:
- OAuth setup with Google/Microsoft
- API keys and tokens
- Complex authentication flows
- Platform-specific implementation

MGC Calendar uses the universal ICS standard that every calendar app already supports. No APIs, no authentication, just works.

## About MGC

MGC = Murrell + [Collaborator] + Claude

Part of the MGC toolkit of practical AI tools built to solve real problems, not add complexity.

## License

MIT

## Author

James Murrell - Business Analyst specializing in AI-assisted tool development

## Contributing

Issues and pull requests welcome!
