-- LinkedIn Post 1: Problem/Solution Focus
INSERT INTO events (
  uid, title, description, location, startDate, endDate, startTime, endTime, 
  allDay, content, tags, status, publishedDate, createdAt, updatedAt
) VALUES (
  'mgc-event-linkedin-post-1@mgc-calendar',
  'LinkedIn Post: Why I Built a Calendar Tool Without OAuth',
  'Post about the frustration with OAuth and the simple alternative',
  '',
  '2026-01-29',
  '2026-01-29',
  '09:00',
  '09:00',
  0,
  'I spent 3 hours setting up OAuth just to add events to my calendar.

Three. Hours.

For something that should take 5 minutes.

That''s when I realized: we''re overcomplicating everything.

Calendar apps have supported ICS files since 1998. Every calendar application - Google, Outlook, Apple Calendar - reads them natively. No APIs. No tokens. No OAuth flows.

So I built MGC Calendar MCP for Claude Desktop.

✅ Zero setup - works immediately
✅ No API keys or authentication
✅ Works with ANY calendar app
✅ 100% local - your data stays on your machine
✅ Visual dashboard for content planning

It uses the ICS standard that''s been working perfectly for 26 years.

Sometimes the old ways are better than the new ones.

If you''re tired of OAuth flows, token management, and API complexity, check it out on GitHub: cs97jjm3/mgc-calendar-mcp

What''s your biggest frustration with modern developer tools? Let me know in the comments.

#DeveloperTools #Productivity #SimpleSolutions #CalendarManagement #OpenSource',
  'LinkedIn',
  'scheduled',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- LinkedIn Post 2: Professional Testing & Reliability
INSERT INTO events (
  uid, title, description, location, startDate, endDate, startTime, endTime, 
  allDay, content, tags, status, publishedDate, createdAt, updatedAt
) VALUES (
  'mgc-event-linkedin-post-2@mgc-calendar',
  'LinkedIn Post: How We Went from 0 to 78 Tests in One Day',
  'Post about building quality software with comprehensive testing',
  '',
  '2026-01-31',
  '2026-01-31',
  '10:00',
  '10:00',
  0,
  'Yesterday: 0 automated tests
Today: 78 passing tests with 85% coverage

Here''s what happened ⬇️

I launched MGC Calendar MCP last week - a calendar manager for Claude Desktop that doesn''t require OAuth (because ICS files just work).

The tool worked. Users loved it. But something bothered me.

No tests = no confidence in future changes.

So I spent a day with Claude (yes, using AI to test an AI tool) and built:

✅ 78 automated tests covering all core functionality
✅ 85% code coverage on critical modules  
✅ GitHub Actions CI/CD for all pull requests
✅ Professional testing documentation

The result? 

Production-ready code that I can confidently iterate on.

Key lesson: Quality doesn''t happen by accident. It''s built deliberately.

For anyone building developer tools or open source projects:
• Start testing early
• Make it part of your workflow
• Use CI/CD from day one
• Document your testing strategy

Your future self (and contributors) will thank you.

Want to see how we structured the tests? Check out the TESTING_GUIDE.md in the repo: cs97jjm3/mgc-calendar-mcp

What''s your testing strategy? Drop your best practices below.

#SoftwareEngineering #Testing #OpenSource #CodeQuality #DeveloperProductivity',
  'LinkedIn',
  'scheduled',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
