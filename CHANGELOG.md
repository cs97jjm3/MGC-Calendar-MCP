# Changelog

All notable changes to MGC Calendar MCP will be documented in this file.

## [1.3.0] - 2026-01-27

### Added
- **Comprehensive Test Suite:** 78 automated tests covering all core functionality
  - 39 tests for database operations (CRUD, UID generation, tags, import/export)
  - 16 tests for ICS generation and parsing
  - 23 integration tests for end-to-end workflows
- **Test Coverage:** ~85% coverage on critical modules (database.ts, ics-generator.ts)
- **Testing Infrastructure:** Vitest 4.0 with coverage reporting
- **Test Scripts:** `npm test`, `npm run test:watch`, `npm run test:coverage`
- **CI/CD:** GitHub Actions workflow for automated testing on Node 18/20/22
- **Documentation:** TESTING_GUIDE.md with comprehensive testing guidelines
- **Status Badges:** Added CI, license, Node.js version badges to README

### Changed
- **CONTRIBUTING.md:** Added automated testing section with coverage requirements
- **Test Configuration:** Configured Vitest for sequential execution to prevent database conflicts
- **Code Quality:** Improved test isolation and cleanup

### Developer Experience
- Professional test suite ensures code quality
- CI/CD automatically runs tests on all PRs
- Coverage reports help identify untested code
- Watch mode for test-driven development
- Clear testing guidelines for contributors

## [1.2.1] - 2026-01-27

### Added
- **Testing Infrastructure:** Added Vitest testing framework
- **Test Suite:** Comprehensive integration tests for database operations (17 tests covering CRUD, edge cases)
- **Test Scripts:** `npm test`, `npm run test:watch`, `npm run test:coverage`
- **Port Check:** Dashboard auto-start now checks if port 3737 is available before spawning process
- **Helper Function:** `generateCombinedICS()` function to reduce code duplication

### Changed
- **Code Quality:** Extracted duplicate ICS generation logic into reusable helper function
- **Dashboard Code:** Reduced dashboard.ts from ~450 lines to ~350 lines by removing duplication
- **Error Handling:** Improved dashboard auto-start error messages with port availability checks
- **Version Sync:** Updated manifest.json version to match package.json (1.2.0)

### Fixed
- **Code Duplication:** Removed three duplicate ICS generation blocks in dashboard.ts
- **Version Mismatch:** Synced manifest.json version (was 1.1.2, now 1.2.0)
- **Port Conflicts:** Dashboard no longer attempts to start if port 3737 is already in use

### Developer Experience
- Added vitest.config.ts for test configuration
- Updated .gitignore to exclude test data directories
- Enhanced README with Development section
- Test coverage reporting available via `npm run test:coverage`

## [1.2.0] - 2026-01-21

### Added
- **List View Filters:** "Content Ready" filter option (shows events with 100+ char descriptions)
- **List View Filters:** Enhanced filtering by status (All / Scheduled / Content Ready / Published)
- **List View Filters:** Filter by tags (LinkedIn, Meeting, Deadline, Personal, Client, Internal)
- **List View Filters:** Filter by date range (All / Past / Today / This Week / This Month / Upcoming)
- **List View Filters:** "Reset Filters" button to clear all filters
- **ICS Download:** Auto-regeneration of missing ICS files on download
- **Cache Troubleshooting:** Documentation for clearing Claude Desktop cache

### Changed
- **Dashboard Layout:** Increased container width from 1400px to 1600px
- **Dashboard Layout:** Reduced calendar cell padding (8px → 4px)
- **Dashboard Layout:** Smaller event text (11px → 10px font)
- **Dashboard Layout:** Reduced day number spacing
- **Dashboard Layout:** Added overflow handling for event text
- **Logging:** All console output now goes to stderr instead of stdout (fixes JSON errors)
- **Export:** Removed "Download All ICS" button (use Export → ICS instead)

### Fixed
- **ICS Downloads:** Now automatically regenerates missing ICS files when downloading
- **ICS Downloads:** Single event downloads work reliably
- **Route Ordering:** Fixed `/api/events/all/ics` route conflict with `/api/events/:id`
- **Browser Caching:** Improved cache handling for dashboard updates
- **JSON Errors:** Fixed "Database initialized" stdout message causing MCP protocol errors

## [1.1.2] - 2026-01-19

### Added
- **Dashboard UI:** Delete button in event edit modal for easier event removal
- **Dashboard UX:** Delete button hidden in create mode, visible only when editing
- **Dashboard UX:** Confirmation dialog before deleting events
- **Debugging:** Console logging for event loading to troubleshoot description field issues

### Changed
- Event modal now shows delete button positioned on the left side when editing
- Improved modal button layout with better spacing

## [1.1.1] - 2026-01-12

### Fixed
- **Database initialization:** Database now automatically initializes before any operations
- **Dashboard auto-start:** Dashboard now automatically starts when MCP server starts
- **Error handling:** Improved error logging for dashboard startup failures
- **Process management:** Better handling of dashboard process spawning

### Changed
- Dashboard auto-starts on MCP server startup
- All database operations ensure database is initialized first
- Improved error messages for database and dashboard issues

## [1.1.0] - 2026-01-12

### Added
- **Import/Export:** Bulk import events from ICS or JSON files
- **Import/Export:** Export all events as ICS or JSON
- **Tags:** Event categorization with six predefined tags
- **Tags:** Colored badge display for tags in calendar views
- **Status Tracking:** Scheduled vs Published status for events
- **Status Tracking:** Visual indicators (blue for scheduled, green for published)
- **Status Tracking:** "Mark as published" quick action checkbox
- **Status Tracking:** Published date tracking
- **Database:** Automatic migration for existing databases

### Changed
- Event interface now includes tags, status, and publishedDate fields
- List view displays tags as colored badges
- Event cards styled with status-based border colors

## [1.0.3] - 2026-01-12

### Changed
- **Breaking:** Switched from `better-sqlite3` to `sql.js` for universal compatibility
- MCPB bundle now works with Claude Desktop's built-in Node.js
- Improved logging throughout server initialization

### Added
- One-click installation via MCPB bundle
- Comprehensive troubleshooting guide
- Database initialization logging on startup

### Fixed
- Server disconnection issues with MCPB installation
- Compatibility with different Node.js versions

## [1.0.0] - 2026-01-11

### Added
- Initial release
- Create, read, update, delete calendar events
- Generate ICS files for universal calendar compatibility
- SQLite database for event tracking
- Web dashboard with month/week/list views
- Content editor for articles
- LinkedIn integration
- Six MCP tools
- No OAuth or API keys required
- Local-first privacy design
