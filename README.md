# MGC Calendar MCP

[![CI](https://github.com/cs97jjm3/mgc-calendar-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/cs97jjm3/mgc-calendar-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

Universal calendar manager for Claude using ICS files - **no OAuth required**.

## What it does

MGC Calendar Manager lets Claude create, update, and delete calendar events using standard ICS files. Works with **any calendar application** (Google Calendar, Outlook, Apple Calendar) without requiring API keys or OAuth setup.

- ✅ Create calendar events via conversation with Claude
- ✅ Track all events in local SQLite database  
- ✅ Generate standard ICS files for universal compatibility
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Store article content directly in events
- ✅ Web dashboard with Month/Week/List views
- ✅ Content editor with LinkedIn posting
- ✅ Import/Export events (ICS and JSON formats)
- ✅ Event tags/categories for organization
- ✅ Scheduled vs Published status tracking
- ✅ No API keys, no OAuth, no cloud dependencies

## Dashboard Features

Launch the web dashboard from Claude Desktop:
```
"Launch the dashboard"
```

**Calendar Views:**
- **Month view** - Full calendar grid with color-coded events
- **Week view** - Hourly time slots (8am-8pm)
- **List view** - Filterable list with search by status, tags, and date range

**List View Filters:**
- Status: All / Scheduled / Content Ready / Published
- Tags: LinkedIn, Meeting, Deadline, Personal, Client, Internal
- Date Range: All / Past / Today / This Week / This Month / Upcoming

**Content Management:**
- Write/edit LinkedIn posts directly in event descriptions
- Character counter (100-3000 chars for LinkedIn)
- "Post to LinkedIn" button - copies content and opens LinkedIn
- Green events = content ready (100+ characters)
- Blue events = scheduled (under 100 characters)
- Purple events = published

**Statistics:**
- Total events
- Upcoming events
- Events this month
- Events with content ready

**Organization & Import/Export:**
- Tag events (LinkedIn, Meeting, Deadline, Personal, Client, Internal)
- Track scheduled vs published status
- Import events from ICS or JSON files
- Export all events as ICS or JSON
- Individual event ICS downloads
- Quick "Mark as published" checkbox

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

**Windows:**
```json
{
  "mcpServers": {
    "mgc-calendar": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\Documents\\GitHub\\mgc-calendar-mcp\\build\\index.js"]
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "mgc-calendar": {
      "command": "node",
      "args": ["/Users/YourUsername/Documents/GitHub/mgc-calendar-mcp/build/index.js"]
    }
  }
}
```

5. **Restart Claude Desktop**

The MCP server will now be available. Launch the dashboard using the `launch_dashboard` tool.

### Dashboard Auto-Launch Behavior

By default, the MGC Calendar dashboard:
- **Starts automatically** when Claude Desktop launches
- **Opens your browser** automatically to http://localhost:3737

This means you'll see the dashboard every time you start Claude Desktop.

**To disable browser auto-launch** (dashboard still runs, just doesn't open browser):

1. Open `src/index.ts` in your editor
2. Find the "Auto-start dashboard" section (around line 415)
3. Comment out the `setTimeout` block that opens the browser:

```typescript
// Browser auto-launch disabled - dashboard runs at http://localhost:3737
// Uncomment below to re-enable auto-launch
// setTimeout(() => {
//   const url = 'http://localhost:3737';
//   const start = process.platform === 'darwin' ? 'open' :
//                process.platform === 'win32' ? 'start' : 'xdg-open';
//   log('DEBUG', `Opening browser: ${start} ${url}`);
//   spawn(start, [url], { shell: true });
// }, 3000);
```

4. Rebuild the project: `npm run build`
5. Restart Claude Desktop

The dashboard will still run at http://localhost:3737 - you just navigate to it manually when you want to use it.

**To re-enable auto-launch**, uncomment those lines and rebuild.

## Usage

### Quick Start with Dashboard

The easiest way to use MGC Calendar is through the web dashboard.

**Launch it from Claude:**
```
"Launch the dashboard"
```

Then open http://localhost:3737 in your browser.

**Creating & Managing Content:**

1. **Click any date** in the calendar to create a new event

2. **Add your LinkedIn post** to the Description field (100-3000 characters)

3. **Click "📤 Post to LinkedIn"** - it copies the description and opens LinkedIn

4. **Paste (Ctrl+V or Cmd+V)** in LinkedIn and publish

5. **Mark as published** when done

**That's it!** No manual ICS imports needed when using the dashboard.

### Create Events via Claude

You can also create events by talking to Claude:

```
"Create a calendar event for LinkedIn post on January 22, 2026 at 9am"
```

Claude will:
1. Create the event in the database
2. Generate an ICS file
3. Give you the file path to import into your calendar app

### Manage Events

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

### Dashboard Features

**View & Filter:**
- Switch between Month, Week, and List views
- Filter by status (All / Scheduled / Content Ready / Published)
- Filter by tags (LinkedIn, Meeting, Deadline, etc.)
- Filter by date range (Past, Today, This Week, etc.)

**Create & Edit:**
- Click empty day to create event on that date
- Click any event to edit details
- Add description (your LinkedIn post content)
- Add tags for organization
- Set as scheduled or published

**Export & Download:**
- Export all events via Export button (choose ICS or JSON)
- Download individual event ICS files from edit modal
- Import events from ICS or JSON files

## File Locations

- **Database**: `~/.mgc-calendar/events.db`
- **ICS files**: `~/.mgc-calendar/ics-files/`
- **Dashboard**: `http://localhost:3737`

## MCP Tools

This MCP server exposes these tools to Claude:

### create_event
Create a new calendar event with title, description, location, dates, and times.

### list_events
List all tracked events sorted by date (soonest first).

### get_event
Get details of a specific event by ID.

### update_event
Update an existing event. Generates new ICS file with same UID.

### delete_event
Delete an event. Generates cancellation ICS file.

### launch_dashboard
Launch the web dashboard at http://localhost:3737 with calendar views and content editor.

## Features

**Universal compatibility**  
Works with Google Calendar, Outlook, Apple Calendar, and any app that supports ICS files.

**No authentication hassle**  
No OAuth flows, no API keys, no token management.

**Local-first**  
All data stored locally in SQLite database. Your content, your control.

**Article management**  
Store article drafts directly in calendar events. Perfect for content schedules.

**Proper UID tracking**  
Events can be updated/cancelled across calendar apps using standard ICS UIDs.

**Web dashboard**  
Visual calendar interface with content editor and LinkedIn integration.

**Simple**  
Just works, no complex setup.

## How It Works

**Creating an event:**
1. You ask Claude to create a calendar event
2. MGC Calendar generates an ICS file with a unique UID
3. Event is saved to local database for tracking
4. You can import the ICS file into your calendar app (optional)

**Updating an event:**
1. You ask Claude to update an event
2. MGC Calendar generates a new ICS file with the SAME UID
3. Database is updated
4. You import the new ICS file (optional)
5. Your calendar app recognizes the UID and updates the existing event

**Deleting an event:**
1. You ask Claude to delete an event
2. MGC Calendar generates a cancellation ICS file
3. Database marks event as deleted
4. You import the cancellation (optional)
5. Your calendar app removes the event

The UID is the secret. It's how calendar applications know these aren't new events - they're updates to existing ones. This is part of the ICS standard.

## Why MGC Calendar?

Most calendar MCP servers require:
- OAuth setup with Google/Microsoft
- API keys and tokens
- Complex authentication flows
- Platform-specific implementation

MGC Calendar uses the universal ICS standard that every calendar app already supports. No APIs, no authentication, just works.

**Old standard beats new API.**

## Technical Details

**Stack:**
- Node.js + TypeScript
- sql.js for local database
- ical-generator for ICS files
- Native HTTP server for dashboard
- @modelcontextprotocol/sdk for Claude integration
- Vitest for testing

**UID Format:**
```
mgc-event-{timestamp}-{random}@mgc-calendar
```

The `@mgc-calendar` domain part isn't a real domain. It doesn't need to be. It just needs to be unique to this system.

## Development

**Running tests:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Building:**
```bash
npm run build
```

**Development mode:**
```bash
npm run dev
```

## About MGC

MGC = Murrell + [Collaborator] + Claude

Part of the MGC toolkit of practical AI tools built to solve real problems, not add complexity.

## License

MIT

## Author

James Murrell - Business Analyst specializing in AI-assisted tool development

**GitHub**: https://github.com/cs97jjm3  
**Guide**: [The Business Analyst's Guide to AI-Assisted Tool Development](https://gumroad.com)

## Contributing

Issues and pull requests welcome!

## Troubleshooting

**Dashboard won't launch:**
```bash
# Launch via Claude Desktop
"Launch the dashboard"

# Or manually start it
npm run dashboard
# Then open http://localhost:3737
```

**Button still showing after update:**
Clear Claude Desktop cache:
- Windows: Delete `%APPDATA%\Claude\Cache`
- macOS: Delete `~/Library/Caches/Claude`
- Then restart Claude Desktop

**Database errors:**
Delete and recreate:
```bash
rm -rf ~/.mgc-calendar
# Then create new events via Claude
```

**ICS files not importing:**
Make sure you're importing from:
```
~/.mgc-calendar/ics-files/
```

**Events not showing in dashboard:**
1. Check browser console (F12)
2. Verify database exists: `~/.mgc-calendar/events.db`
3. Restart dashboard from Claude Desktop

## Version History

**v1.3.0** (January 27, 2026)
- Added comprehensive test suite (78 automated tests)
- 85%+ code coverage on critical modules
- GitHub Actions CI/CD for automated testing
- Testing documentation and guidelines
- Status badges in README
- Improved code quality and maintainability

**v1.2.0** (January 21, 2026)
- Added "Content Ready" filter to list view
- Improved list view filters (Status, Tags, Date Range)
- Fixed ICS file regeneration - auto-generates missing files on download
- Removed "Download All ICS" button (use Export → ICS instead)
- Improved calendar layout - wider container, better spacing
- Fixed logging - all logs now go to stderr (no more JSON errors)
- Better color coding in calendar views

**v1.1.1** (January 2026)
- Fixed database initialization errors
- Dashboard now auto-starts when MCP server starts
- Improved error handling and logging

**v1.1.0** (January 2026)
- Bulk import/export (ICS and JSON formats)
- Event tags/categories with colored badges
- Scheduled vs Published status tracking
- "Mark as published" quick action
- Published date tracking

**v1.0.0** (January 2026)
- Initial release
- Basic CRUD operations
- ICS file generation
- Web dashboard with calendar views
- Article content storage
- LinkedIn posting integration

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check TROUBLESHOOTING.md for common problems
- Review the guide for detailed development process
