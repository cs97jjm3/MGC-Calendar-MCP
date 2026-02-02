/**
 * Add LinkedIn Posts to MGC Calendar
 * 
 * Run with: node scripts/add-linkedin-posts.js
 */

import { ensureDb, createEvent } from '../build/database.js';

await ensureDb();

console.log('Creating LinkedIn posts...\n');

// Post 1: Problem/Solution Focus
const post1 = createEvent({
  title: 'LinkedIn Post: Why I Built a Calendar Tool Without OAuth',
  description: 'Post about the frustration with OAuth and the simple alternative',
  startDate: '2026-01-29',
  startTime: '09:00',
  content: `I spent 3 hours setting up OAuth just to add events to my calendar.

Three. Hours.

For something that should take 5 minutes.

That's when I realized: we're overcomplicating everything.

Calendar apps have supported ICS files since 1998. Every calendar application - Google, Outlook, Apple Calendar - reads them natively. No APIs. No tokens. No OAuth flows.

So I built MGC Calendar MCP for Claude Desktop.

✅ Zero setup - works immediately
✅ No API keys or authentication
✅ Works with ANY calendar app
✅ 100% local - your data stays on your machine
✅ Visual dashboard for content planning

It uses the ICS standard that's been working perfectly for 26 years.

Sometimes the old ways are better than the new ones.

If you're tired of OAuth flows, token management, and API complexity, check it out on GitHub: cs97jjm3/mgc-calendar-mcp

What's your biggest frustration with modern developer tools? Let me know in the comments.

#DeveloperTools #Productivity #SimpleSolutions #CalendarManagement #OpenSource`,
  tags: 'LinkedIn',
  status: 'scheduled'
});

console.log('✅ Created Post 1:', post1.title);
console.log('   Scheduled for:', post1.startDate, 'at', post1.startTime);
console.log('   Character count:', post1.content.length, '\n');

// Post 2: Professional Testing & Reliability
const post2 = createEvent({
  title: 'LinkedIn Post: How We Went from 0 to 78 Tests in One Day',
  description: 'Post about building quality software with comprehensive testing',
  startDate: '2026-01-31',
  startTime: '10:00',
  content: `Yesterday: 0 automated tests
Today: 78 passing tests with 85% coverage

Here's what happened ⬇️

I launched MGC Calendar MCP last week - a calendar manager for Claude Desktop that doesn't require OAuth (because ICS files just work).

The tool worked. Users loved it. But something bothered me.

No tests = no confidence in future changes.

So I spent a day with Claude (yes, using AI to test an AI tool) and built:

✅ 78 automated tests covering all core functionality
✅ 85% code coverage on critical modules  
✅ GitHub Actions CI/CD for all pull requests
✅ Professional testing documentation

The result? 

Production-ready code that I can confidently iterate on.

Key lesson: Quality doesn't happen by accident. It's built deliberately.

For anyone building developer tools or open source projects:
• Start testing early
• Make it part of your workflow
• Use CI/CD from day one
• Document your testing strategy

Your future self (and contributors) will thank you.

Want to see how we structured the tests? Check out the TESTING_GUIDE.md in the repo: cs97jjm3/mgc-calendar-mcp

What's your testing strategy? Drop your best practices below.

#SoftwareEngineering #Testing #OpenSource #CodeQuality #DeveloperProductivity`,
  tags: 'LinkedIn',
  status: 'scheduled'
});

console.log('✅ Created Post 2:', post2.title);
console.log('   Scheduled for:', post2.startDate, 'at', post2.startTime);
console.log('   Character count:', post2.content.length, '\n');

console.log('🎉 Both LinkedIn posts created successfully!');
console.log('\nNext steps:');
console.log('1. Open the MGC Calendar dashboard: http://localhost:3737');
console.log('2. Find the posts in your calendar');
console.log('3. Click "📤 Post to LinkedIn" when ready to publish');
