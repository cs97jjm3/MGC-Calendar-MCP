# MGC Calendar MCP - Roadmap

This roadmap outlines the planned features and improvements for MGC Calendar MCP. Dates are estimates and subject to change based on user feedback and priorities.

## Current Version: 1.0.0
Released: January 11, 2026

Full CRUD operations, web dashboard, LinkedIn integration, ICS file generation.

---

## Version 1.1 - Enhanced Dashboard
**Target: February 2026**

### Features In Progress
- ✅ Web dashboard with Month/Week/List views
- ✅ Content editor with character counter
- ✅ LinkedIn posting integration
- ⏳ Bulk import/export operations
- ⏳ Search and filtering in dashboard
- ⏳ Event categories/tags

### Technical Improvements
- [ ] Unit tests for database operations
- [ ] Integration tests for ICS generation
- [ ] API endpoint tests
- [ ] Error handling improvements
- [ ] Input validation enhancements

### Documentation
- [ ] API documentation for dashboard endpoints
- [ ] Architecture documentation
- [ ] Contributing guidelines
- [ ] Issue templates

---

## Version 1.2 - User Experience
**Target: March 2026**

### Dashboard Improvements
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop event editing
- [ ] Quick-add event from any view
- [ ] Print-friendly calendar view

### Search and Filter
- [ ] Search events by title, description, location
- [ ] Filter by date range
- [ ] Filter by tags/categories
- [ ] Sort options (date, title, created, updated)

### Event Templates
- [ ] Save event as template
- [ ] Create event from template
- [ ] Pre-populated fields for common event types
- [ ] Article schedule templates

---

## Version 2.0 - Automation and Sync
**Target: Q2 2026**

### Automated Calendar Sync
**Goal:** Remove manual ICS import step

Current flow:
1. Create event in Claude
2. Generate ICS file
3. Import ICS file to calendar

Target flow:
1. Create event in Claude
2. Event automatically appears in calendar

**Implementation options being evaluated:**
- CalDAV integration (standard protocol)
- Platform-specific APIs (optional OAuth for those who want it)
- Local calendar file watchers
- Browser extension for direct calendar access

**Design principle:** Maintain zero-config as default, add sync as optional feature.

### Recurring Events
- [ ] Daily, weekly, monthly, yearly patterns
- [ ] Custom recurrence rules
- [ ] End date or occurrence count
- [ ] Exception dates
- [ ] Generate ICS with RRULE

### Enhanced Content Management
- [ ] Multiple content versions per event
- [ ] Content history/versioning
- [ ] Markdown support in content editor
- [ ] Auto-save drafts
- [ ] Export content to Markdown files

---

## Version 2.1 - Analytics and Intelligence
**Target: Q3 2026**

### Writing Analytics
- [ ] Articles scheduled vs published
- [ ] Average time between drafts
- [ ] Content velocity trends
- [ ] Busiest writing days/times
- [ ] Goal tracking (e.g., "2 articles per week")

### Smart Scheduling
- [ ] Suggest optimal posting times based on past data
- [ ] Detect schedule conflicts
- [ ] Recommend gaps for new articles
- [ ] Notification for upcoming deadlines

### Reporting
- [ ] Weekly summary reports
- [ ] Monthly content calendar
- [ ] Export reports as PDF
- [ ] Email digest option (if users want it)

---

## Version 3.0 - Collaboration
**Target: Q4 2026**

### Multi-User Support
- [ ] Share calendar with other users
- [ ] Collaborative event editing
- [ ] Comments on events
- [ ] Permission levels (view, edit, admin)

### Team Features
- [ ] Team content calendar
- [ ] Assign events to team members
- [ ] Approval workflow for articles
- [ ] Team analytics

**Note:** This version depends on user demand. MGC Calendar was built for solo users, and that may remain the focus. Collaboration features only if there's clear need.

---

## Long-Term Vision

### Core Principles (Never Compromise)
1. **Simple by default** - Zero-config setup remains the default
2. **Local-first** - User data stays on user's machine
3. **Universal compatibility** - ICS standard always supported
4. **No mandatory authentication** - OAuth stays optional

### Possible Future Directions
- Browser extension for quick event capture
- Mobile app (iOS/Android)
- Desktop app (Electron wrapper)
- VS Code extension
- Obsidian plugin
- Integration with other MGC tools

### What MGC Calendar Won't Do
- **Cloud-only storage** - Local database is non-negotiable
- **Mandatory OAuth** - Will always support ICS files
- **Paid subscriptions** - MIT license, free forever
- **Analytics tracking** - No telemetry, no data collection
- **Advertising** - Never

---

## How Priorities Are Set

### What Drives Development
1. **User requests** - Issues and feedback from real users
2. **Author needs** - Tools the MGC team actually uses
3. **Technical debt** - Code quality and maintenance
4. **Industry standards** - Supporting calendar standards properly

### How to Influence the Roadmap
- **Open an issue** on GitHub describing your need
- **Vote on existing issues** with 👍 reactions
- **Submit a pull request** for features you've built
- **Share use cases** that aren't covered by current features

---

## Version History

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| 1.0.0   | Jan 11, 2026 | Initial release, web dashboard, LinkedIn integration |
| 1.1.0   | Feb 2026 (planned) | Bulk operations, search, filtering |
| 1.2.0   | Mar 2026 (planned) | Dark mode, templates, UX improvements |
| 2.0.0   | Q2 2026 (planned) | Auto-sync, recurring events, versioning |
| 2.1.0   | Q3 2026 (planned) | Analytics, smart scheduling |
| 3.0.0   | Q4 2026 (maybe) | Collaboration features (if demand exists) |

---

## Contributing to the Roadmap

Want to help shape MGC Calendar's future?

1. **Tell us what you need** - Open an issue describing your use case
2. **Build it yourself** - Submit a pull request for features you've added
3. **Test early versions** - Help validate new features before release
4. **Share feedback** - Let us know what works and what doesn't

The best features come from real users solving real problems.

---

## Questions?

Open an issue or check the README for contact information.

**Remember:** MGC Calendar exists because OAuth was too complicated. We keep that principle in mind for every feature we consider adding.
