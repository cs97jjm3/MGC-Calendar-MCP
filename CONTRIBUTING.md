# Contributing to MGC Calendar MCP

Thanks for your interest in contributing to MGC Calendar MCP. This document explains how to set up your development environment and submit changes.

## Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Install dependencies**: `npm install`
4. **Build the project**: `npm run build`
5. **Make your changes**
6. **Test your changes** (see Testing section)
7. **Submit a pull request**

## Development Setup

### Requirements
- Node.js 16 or higher
- npm (comes with Node.js)
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/mgc-calendar-mcp.git
cd mgc-calendar-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Development Workflow

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start dashboard server
npm run dashboard
```

### Testing Your Changes

#### Manual Testing

1. **Test MCP tools via Claude Desktop:**
   - Add your local build to Claude Desktop config
   - Use tools through conversation
   - Verify ICS files are generated correctly

2. **Test the dashboard:**
   - Run `npm run dashboard`
   - Open http://localhost:3737
   - Test all calendar views (Month, Week, List)
   - Test event CRUD operations
   - Test LinkedIn integration

3. **Test ICS file import:**
   - Generate ICS files using the tools
   - Import them into Google Calendar, Outlook, or Apple Calendar
   - Verify events appear correctly
   - Test updates (should update existing event, not create duplicate)
   - Test cancellations (should remove event)

#### Database Testing

```bash
# Check database location
ls ~/.mgc-calendar/

# View database contents (requires sqlite3)
sqlite3 ~/.mgc-calendar/events.db "SELECT * FROM events;"
```

## Code Style

### TypeScript Guidelines

- Use ES modules (`import`/`export`)
- Use strict TypeScript types
- Add JSDoc comments to exported functions
- Use `async`/`await` over callbacks
- Follow existing code patterns

### Example: Good Function Documentation

```typescript
/**
 * Create a new calendar event
 * 
 * @param input - Event details (title, dates, times, etc.)
 * @returns Created event with generated ID and UID
 * @throws Error if date format is invalid
 */
export function createEvent(input: CreateEventInput): CalendarEvent {
  // Implementation
}
```

### File Organization

```
src/
├── index.ts           # MCP server entry point
├── database.ts        # SQLite operations
├── ics-generator.ts   # ICS file generation
├── dashboard.ts       # Web server for dashboard
└── types.ts           # TypeScript type definitions
```

## Making Changes

### Before You Start

1. **Check existing issues** - Someone may already be working on it
2. **Open an issue** - Discuss significant changes before implementing
3. **Keep changes focused** - One feature or fix per pull request

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
- "Add search functionality to dashboard"
- "Fix: Event times not displaying in week view"
- "Update README with new dashboard features"

Bad:
- "updates"
- "fix stuff"
- "changes"
```

### Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** if applicable (once test framework is set up)
3. **Ensure builds pass**: `npm run build`
4. **Update CHANGELOG.md** with your changes
5. **Submit PR** with clear description of changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Changes
- List specific changes made
- Include any breaking changes
- Note any new dependencies

## Testing
How you tested these changes

## Related Issues
Fixes #123 (if applicable)
```

## Areas Where We Need Help

### High Priority
- [ ] Unit tests for database operations
- [ ] Integration tests for ICS generation
- [ ] Error handling improvements
- [ ] Input validation enhancements

### Medium Priority
- [ ] Bulk import/export features
- [ ] Search and filtering in dashboard
- [ ] Dark mode for dashboard
- [ ] Keyboard shortcuts

### Low Priority
- [ ] GitHub Actions workflow
- [ ] Additional calendar views
- [ ] Mobile-responsive improvements

## Design Principles

When contributing, keep these principles in mind:

1. **Simple by Default**
   - Zero-config setup should remain the default
   - Advanced features should be optional

2. **Universal Compatibility**
   - ICS standard is non-negotiable
   - Works with any calendar app

3. **Local First**
   - User data stays on user's machine
   - No mandatory cloud services

4. **No Mandatory Authentication**
   - OAuth remains optional
   - Basic functionality works without any auth

## Technical Decisions

### Why ICS Files?

ICS is a universal standard supported by every calendar application. It requires no authentication, no API keys, and no platform-specific code. It's been working perfectly since 1998.

### Why SQLite?

SQLite provides a local database without requiring a database server. It's perfect for desktop applications and keeps all data on the user's machine.

### Why No Express?

The dashboard uses Node.js's built-in HTTP server. It's simple, lightweight, and sufficient for a local-only application.

### Why TypeScript?

Type safety catches bugs at compile time and improves code maintainability. The slight overhead is worth it for a project that others will contribute to.

## Questions?

- **Got stuck?** Open an issue and ask for help
- **Not sure if feature fits?** Open an issue to discuss first
- **Found a bug?** Open an issue with reproduction steps
- **Have a question?** Check existing issues or open a new one

## Code of Conduct

Be respectful. Be helpful. Be constructive.

This is a tool built by people who got frustrated with complexity. Let's keep it simple, useful, and welcoming.

## Recognition

Contributors will be:
- Listed in CHANGELOG.md for their contributions
- Credited in README.md (for significant contributions)
- Thanked in release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Thank You

Every contribution, no matter how small, makes MGC Calendar better for everyone. Thanks for taking the time to contribute.
