# MGC Calendar MCP - Roadmap

This roadmap outlines the planned features and improvements for MGC Calendar MCP. Dates are estimates and subject to change based on user feedback and priorities.

## Current Version: 1.3.0
Released: January 27, 2026

Comprehensive test suite (78 tests), CI/CD pipeline, professional documentation.

---

## Version 1.4 - UX Improvements
**Target: February 2026**

### Priority: AI-Powered Intelligent Scheduling
- [ ] **"Reschedule Optimally" button** - AI analyzes and suggests better times
  - Shows current schedule with engagement scores
  - Suggests optimal times with reasoning ("Tuesday mornings get 40% more engagement")
  - Preview before/after schedules side-by-side
  - One-click to apply all suggestions
  - "Undo" option if you don't like the changes
- [ ] **Optimal time suggestions** - AI analyzes LinkedIn best practices and suggests posting times
  - Tuesday-Thursday preferred (highest engagement)
  - Morning slots (8-10am) or lunch (12-2pm) in user's timezone
  - Avoid weekends, holidays, major events
- [ ] **Smart spacing** - AI ensures posts are strategically spaced (2-3 days apart)
- [ ] **Content-aware timing** - Different content types get different optimal times
  - Technical deep-dives: Tuesday/Wednesday mornings
  - Personal stories: Thursday afternoons
  - Quick tips: Friday mornings
- [ ] **Audience optimization** - Consider your audience's location and timezone
- [ ] **Performance learning** - Track which times get best engagement, adjust recommendations
- [ ] **Conflict detection** - "You already have a post on Tuesday, schedule for Wednesday instead?"
- [ ] **Batch scheduling assistant** - "Schedule these 10 posts optimally over next month"
- [ ] **Natural language scheduling** - "Schedule this for the next optimal slot" (AI picks best time)

### Priority: Better Event Management UX
- [ ] Drag-and-drop events between dates in calendar view
- [ ] Quick-edit mode (click to edit inline without modal)
- [ ] Event duplication ("Copy event" button)
- [ ] Keyboard shortcuts (n=new, e=edit, d=delete, /=search)
- [ ] Undo/redo for event operations
- [ ] Bulk select and edit multiple events
- [ ] Right-click context menus

### Priority: Search Improvements
- [ ] Full-text search across title, description, location, content
- [ ] Search filters (date range, tags, status)
- [ ] Search suggestions as you type
- [ ] Recent searches dropdown
- [ ] Save search queries
- [ ] Highlight search terms in results

### Priority: Overall UX
- [ ] Dark mode toggle with system preference detection
- [ ] Improved mobile responsiveness
- [ ] Loading states and progress indicators
- [ ] Toast notifications for actions ("Event created", "Event deleted")
- [ ] Confirmation dialogs for destructive actions
- [ ] Empty states with helpful guidance
- [ ] Keyboard navigation throughout dashboard

### Priority: Recurring Events
- [ ] Daily, weekly, monthly patterns
- [ ] Custom recurrence (every N days/weeks/months)
- [ ] End after N occurrences or by date
- [ ] Skip specific dates (exceptions)
- [ ] Generate ICS with RRULE standard
- [ ] Visual indicator for recurring events
- [ ] "Edit series" vs "Edit this event" options

---

## Version 1.2 - User Experience
**Target: March 2026**

### Dashboard Improvements
- [ ] Dark mode toggle

### Search and Filter
- [ ] Search events by title, description, location



---

## Version 2.0 - Automation and Sync
**Target: Q2 2026**

### Calendar Sync
Optional synchronization with external calendars for users who want it.

**Implementation options being evaluated:**
- CalDAV integration (standard protocol)
- Platform-specific APIs (optional OAuth for those who want it)
- Local calendar file watchers

**Design principle:** Maintain zero-config as default, add sync as optional feature.

### Recurring Events
- [ ] Daily, weekly, monthly, yearly patterns
- [ ] Custom recurrence rules
- [ ] End date or occurrence count
- [ ] Exception dates
- [ ] Generate ICS with RRULE


---

## Version 2.1 - Smart Scheduling
**Target: Q3 2026**

### Posting Intelligence
- [ ] Suggest optimal posting times based on past data
- [ ] Detect schedule conflicts
- [ ] Recommend gaps for new articles
- [ ] Notification for upcoming deadlines



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
| 1.0.0   | Jan 2026 | Initial release, web dashboard, LinkedIn integration |
| 1.1.0   | Jan 2026 | Import/export, tags, status tracking |
| 1.3.0   | Jan 2026 | Test suite (78 tests), CI/CD, professional documentation |
| 1.4.0   | Feb 2026 (planned) | UX improvements, search, recurring events |
| 2.0.0   | Q2 2026 (planned) | Auto-sync, templates, analytics |
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
