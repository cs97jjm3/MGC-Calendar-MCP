# I Built a Calendar Manager in 4 Hours (While OAuth Takes 4 Days)

This weekend I needed to schedule five article deadlines over the next 90 days. Simple task. Should take 5 minutes.

Except I'm working entirely through Claude now. And every calendar tool for Claude requires OAuth setup with Google or Microsoft.

API keys. Authentication flows. Token management. Platform-specific implementations.

For five calendar events.

I looked at the clock. 2pm on a Saturday. I had two choices:

1. Spend the afternoon wrestling with OAuth documentation
2. Build something that actually works

I picked option 2.

Four hours later, I had MGC Calendar MCP. Universal calendar manager. No OAuth. No API keys. No authentication flows.

It works with every calendar application ever made.

Here's what happened.

## The Problem With Modern Calendar Tools

Every MCP server that touches calendars follows the same pattern:

**Step 1:** Create a Google Cloud or Microsoft Azure account  
**Step 2:** Enable the Calendar API  
**Step 3:** Create OAuth credentials  
**Step 4:** Configure redirect URIs  
**Step 5:** Handle the authentication flow  
**Step 6:** Manage token refresh  
**Step 7:** Deal with scope permissions  
**Step 8:** Handle API rate limits  
**Step 9:** Actually create a calendar event  

This isn't development. This is bureaucracy.

And it's completely unnecessary.

## The Solution Nobody Talks About

ICS files.

You know, those `.ics` files that every calendar application has supported since 1998?

The universal standard that works with:
- Google Calendar
- Outlook
- Apple Calendar
- Thunderbird
- Every other calendar app ever created

No APIs. No authentication. No platform lock-in.

Just a text file with a specific format.

Why isn't anyone using this?

Because we're all obsessed with "modern" API-first solutions. We've forgotten that sometimes the old standards work better than the new APIs.

## The Build

I needed four components:

**1. SQLite Database**  
Track calendar events locally. Every event gets stored with its details and a unique identifier.

**2. ICS Generator**  
Convert event data into proper ICS format. This is the magic - each event gets a UID that persists across updates and deletions.

**3. MCP Server**  
Expose five tools to Claude:
- `create_event` - Make new calendar events
- `list_events` - Show all tracked events
- `get_event` - Get details of a specific event
- `update_event` - Modify existing events
- `delete_event` - Remove events

**4. File Management**  
Save ICS files to a local directory where users can import them into any calendar app.

The entire thing is 300 lines of TypeScript.

## How It Actually Works

**Creating an event:**

1. You ask Claude: "Create a calendar event for Article 2 writing session on January 22nd at 2pm"
2. Claude calls the `create_event` tool
3. MGC Calendar generates an ICS file with a unique UID
4. Event is saved to SQLite database
5. ICS file is written to `~/.mgc-calendar/ics-files/`
6. You import the ICS file into your calendar app

**Updating an event:**

1. You ask Claude: "Change that event to 3pm instead"
2. Claude calls the `update_event` tool
3. MGC Calendar generates a new ICS file with the SAME UID
4. Database is updated
5. You import the new ICS file
6. Your calendar app recognizes the UID and updates the existing event

**Deleting an event:**

1. You ask Claude: "Cancel that meeting"
2. Claude calls the `delete_event` tool
3. MGC Calendar generates a cancellation ICS file
4. Database marks event as deleted
5. You import the cancellation
6. Your calendar app removes the event

The UID is the secret. It's how calendar applications know these aren't new events - they're updates to existing ones.

This is part of the ICS standard. It's been working perfectly for 27 years.

## The Results

**Build time:** 4 hours  
**Lines of code:** 300  
**Dependencies:** 4 npm packages  
**OAuth configuration:** 0  
**API keys required:** 0  
**Calendar apps it works with:** All of them  

I created nine calendar events for my article writing schedule. Every one of them works perfectly in Google Calendar.

Total setup time for a new user: 30 seconds.

Compare that to OAuth setup time: 4 hours minimum. 4 days if you've never done it before.

## What This Teaches Us

**Lesson 1: Old standards aren't obsolete**

ICS files work everywhere. They'll work on platforms that don't exist yet. They'll outlive whatever calendar API is trendy this year.

**Lesson 2: Complexity isn't always better**

OAuth exists for good reasons - multi-user apps, security boundaries, controlled access. But for a personal calendar manager? It's overkill.

**Lesson 3: Universal beats platform-specific**

An MCP server that only works with Google Calendar excludes everyone using Outlook or Apple Calendar. ICS files work with everything.

**Lesson 4: Ship working solutions**

I could have spent a week building OAuth flows and rate limit handling and error recovery. Instead I shipped something that works in 4 hours.

Perfect is the enemy of done.

## The Technical Details

For developers who want to build something similar:

**ical-generator** - npm package for creating ICS files  
**better-sqlite3** - Fast SQLite database for Node.js  
**@modelcontextprotocol/sdk** - MCP server framework  
**zod** - Runtime type validation  

The tricky part is the UID format. It needs to be:
- Globally unique
- Persistent across updates
- Formatted correctly for ICS standard

I use: `mgc-event-{timestamp}-{random}@mgc-calendar`

The `@mgc-calendar` domain part isn't a real domain. It doesn't need to be. It just needs to be unique to this system.

## What's Next

Version 1.0 is live on GitHub: https://github.com/cs97jjm3/mgc-calendar-mcp

Version 1.1 will add:
- Web-based dashboard for visual calendar view
- Bulk import/export operations
- Search and filtering
- Statistics on event patterns

But v1.0 is fully functional. You can use it right now.

## The Bigger Picture

This is tool #9 in my AI-assisted development toolkit. Each one follows the same pattern:

1. Find a real problem
2. Look for the simplest solution
3. Ignore "modern best practices" if they add unnecessary complexity
4. Ship something that works

I'm not anti-OAuth. I'm not anti-API. I'm anti-complexity-for-its-own-sake.

Sometimes the solution is newer technology. Sometimes it's older technology used in a new way.

The goal isn't to use the fanciest tools. The goal is to solve the problem.

## Try It Yourself

If you want to see how simple calendar management can be:

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Add it to your Claude Desktop config
5. Start creating calendar events

No OAuth. No API keys. No authentication flows.

Just works.

---

**James Murrell**  
Business Analyst | AI Tool Developer  
Building practical automation tools at https://github.com/cs97jjm3

