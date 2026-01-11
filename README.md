# MGC Calendar MCP

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
- ✅ No API keys, no OAuth, no cloud dependencies

## Dashboard Features

Launch the web dashboard from Claude Desktop:
```
"Launch the dashboard"
```

**Calendar Views:**
- Month view - Full calendar grid with events
- Week view - Hourly time slots (8am-8pm)
- List view - All events with full details

**Content Management:**
- Write/edit article content directly in events
- Character counter (100-3000 chars for LinkedIn)
- "Post to LinkedIn" button - copies content and opens LinkedIn
- Events with content show as green in calendar views

**Statistics:**
- Total events
- Upcoming events
- Events this month
- Events with content

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
      "args": ["C:\\Users\\YourUsername\\Documents\\GitHub\\mgc-calendar-mcp\\build\\index.js"]
    }
  }
}
```

5. **Restart Claude Desktop**

## Usage

### Create Events

Ask Claude to create calendar events:

```
"Create a calendar event for Article 2 writing session on January 22, 2026 at 2pm"
```

Claude will:
1. Create the event in the database
2. Generate an ICS file
3. Give you the file path to import

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

### Use the Dashboard

**Launch dashboard:**
```
"Launch the dashboard"
```

Then:
- Click events to edit them
- Click empty days to create new events
- Click "Add Content" to write articles
- Click "Post to LinkedIn" to share content

### Add Article Content

1. Open the dashboard
2. Click an event in any view
3. Click "Add Content" button
4. Write your article (100-3000 characters)
5. Save content
6. Click "Post to LinkedIn" to copy and share

## File Locations

- **Database**: `~/.mgc-calendar/events.db`
- **ICS files**: `~/.mgc-calendar/ics-files/`

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
4. You import the ICS file into your calendar app

**Updating an event:**
1. You ask Claude to update an event
2. MGC Calendar generates a new ICS file with the SAME UID
3. Database is updated
4. You import the new ICS file
5. Your calendar app recognizes the UID and updates the existing event

**Deleting an event:**
1. You ask Claude to delete an event
2. MGC Calendar generates a cancellation ICS file
3. Database marks event as deleted
4. You import the cancellation
5. Your calendar app removes the event

The UID is the secret. It's how calendar applications know these aren't new events - they're updates to existing ones. This is part of the ICS standard. It's been working perfectly for 27 years.

## Why MGC Calendar?

Most calendar MCP servers require:
- OAuth setup with Google/Microsoft
- API keys and tokens
- Complex authentication flows
- Platform-specific implementation

MGC Calendar uses the universal ICS standard that every calendar app already supports. No APIs, no authentication, just works.

**Old standard beats new API.**

## Roadmap

**v1.1 (in progress):**
- ✅ Web-based dashboard for visual management
- ✅ Article content storage and editing
- ✅ LinkedIn posting integration
- ⏳ Bulk import/export operations
- ⏳ Search and filtering

**v2.0 (planned):**
- Calendar sync without manual ICS imports
- Recurring events support
- Event categories and tags
- Analytics on writing schedule

## Technical Details

**Stack:**
- Node.js + TypeScript
- better-sqlite3 for local database
- ical-generator for ICS files
- Native HTTP server for dashboard
- @modelcontextprotocol/sdk for Claude integration

**UID Format:**
```
mgc-event-{timestamp}-{random}@mgc-calendar
```

The `@mgc-calendar` domain part isn't a real domain. It doesn't need to be. It just needs to be unique to this system.

## About MGC

MGC = Murrell + [Collaborator] + Claude

Part of the MGC toolkit of practical AI tools built to solve real problems, not add complexity.

This is tool #9 in the series. Each tool follows the same pattern:
1. Find a real problem
2. Look for the simplest solution
3. Ignore "modern best practices" if they add unnecessary complexity
4. Ship something that works

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
# Manually start it
npm run dashboard
# Then open http://localhost:3737
```

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
3. Restart dashboard: Close tab, run `npm run dashboard`

## Version History

**v1.0.0** (January 11, 2026)
- Initial release
- Basic CRUD operations
- ICS file generation
- Web dashboard with calendar views
- Article content storage
- LinkedIn posting integration
- Launch from Claude Desktop

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the guide for detailed development process
- Review Article 2: "I Built a Calendar Manager in 4 Hours"
