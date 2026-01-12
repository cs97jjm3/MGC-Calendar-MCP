# Changelog

All notable changes to MGC Calendar MCP will be documented in this file.

## [1.1.0] - 2026-01-12

### Added
- **Import/Export:** Bulk import events from ICS or JSON files
- **Import/Export:** Export all events as ICS or JSON
- **Tags:** Event categorization with six predefined tags (LinkedIn, Meeting, Deadline, Personal, Client, Internal)
- **Tags:** Colored badge display for tags in calendar views
- **Status Tracking:** Scheduled vs Published status for events
- **Status Tracking:** Visual indicators (blue for scheduled, green for published)
- **Status Tracking:** "Mark as published" quick action checkbox
- **Status Tracking:** Published date tracking
- **Database:** Automatic migration for existing databases to add new columns
- **API:** POST /api/import endpoint for importing events
- **API:** GET /api/export?format=json|ics endpoint for exporting events
- **API:** POST /api/events/:id/publish endpoint for marking events as published
- **UI:** Import button in dashboard controls
- **UI:** Export button with format selection
- **UI:** Tags selector in event creation/edit form
- **UI:** Status radio buttons (Scheduled/Published)
- **UI:** Published date field

### Changed
- Event interface now includes tags, status, and publishedDate fields
- List view displays tags as colored badges
- List view shows status indicators and published dates
- Event cards styled with status-based border colors

## [1.0.3] - 2026-01-12

### Changed
- **Breaking:** Switched from `better-sqlite3` to `sql.js` for universal Node.js compatibility
- MCPB bundle now works with Claude Desktop's built-in Node.js
- Improved logging throughout server initialization
- Enhanced error messages for better troubleshooting

### Added
- One-click installation via MCPB bundle (recommended method)
- Comprehensive troubleshooting guide (TROUBLESHOOTING.md)
- MCPB packaging documentation (MCPB-PACKAGING.md)
- Database initialization logging on startup
- Type definitions for sql.js

### Fixed
- Server disconnection issues with MCPB installation
- Compatibility with different Node.js versions
- Native module dependency issues in bundled environment

## [1.0.2] - 2026-01-12

### Changed
- Updated manifest for Desktop Extensions compatibility
- Improved bundle structure

## [1.0.1] - 2026-01-11

### Added
- Enhanced logging with timestamps and severity levels
- Installation verification on startup
- Directory creation with error handling
- Detailed error messages for all operations

### Changed
- Improved error handling in dashboard launch
- Better validation error messages
- More informative tool execution logs

## [1.0.0] - 2026-01-11

### Added
- Initial release
- Create, read, update, delete calendar events
- Generate ICS files for universal calendar compatibility
- SQLite database for event tracking
- Web dashboard with month/week/list views
- Content editor for articles
- LinkedIn integration (copy content)
- Six MCP tools: create_event, list_events, get_event, update_event, delete_event, launch_dashboard
- No OAuth or API keys required
- Local-first privacy design
