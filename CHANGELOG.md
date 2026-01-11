# Changelog

All notable changes to MGC Calendar MCP will be documented in this file.

## [1.0.0] - 2026-01-11

### Added
- Initial release
- Basic calendar event CRUD operations (Create, Read, Update, Delete)
- ICS file generation with proper UIDs
- SQLite database for event tracking
- MCP server integration with Claude Desktop
- Five MCP tools: create_event, list_events, get_event, update_event, delete_event
- Web dashboard with HTTP server (port 3737)
- Month view calendar with full grid layout
- Week view calendar with hourly time slots (8am-8pm)
- List view with sortable events (soonest first)
- Article content storage directly in events
- Content editor modal with character counter (100-3000 chars)
- LinkedIn posting integration (copies content, opens LinkedIn)
- Visual indicators for events with content (green highlighting)
- Launch dashboard tool from Claude Desktop
- Statistics display (total events, upcoming, this month, with content)
- Click events to edit them
- Click empty days to create new events on that date
- Responsive design for mobile/tablet

### Technical
- TypeScript + ES modules
- better-sqlite3 for local database
- ical-generator for ICS file creation
- Native Node.js HTTP server (no Express)
- @modelcontextprotocol/sdk v1.0.4
- Single-file HTML dashboard (no build step for frontend)
- Automatic database migrations for content field

### Files
- Database: `~/.mgc-calendar/events.db`
- ICS files: `~/.mgc-calendar/ics-files/`
- Dashboard: Port 3737

## [Unreleased]

### Planned
- Bulk import/export operations
- Search and filtering in dashboard
- Event categories and tags
- Recurring events support
- Calendar sync without manual ICS imports
- Analytics on writing schedules
- Email notifications for upcoming events
- Dark mode for dashboard
