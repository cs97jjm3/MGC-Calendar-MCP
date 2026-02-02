# LinkedIn Posts Created

Two LinkedIn posts have been created as calendar events in MGC Calendar MCP.

---

## Post 1: Why I Built a Calendar Tool Without OAuth
**Scheduled:** January 29, 2026 at 9:00 AM  
**Theme:** Problem/Solution - OAuth frustration  
**Character count:** 841 characters  

### Content:
I spent 3 hours setting up OAuth just to add events to my calendar.

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

#DeveloperTools #Productivity #SimpleSolutions #CalendarManagement #OpenSource

---

## Post 2: How We Went from 0 to 78 Tests in One Day
**Scheduled:** January 31, 2026 at 10:00 AM  
**Theme:** Professional development - Testing & Quality  
**Character count:** 985 characters  

### Content:
Yesterday: 0 automated tests
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

#SoftwareEngineering #Testing #OpenSource #CodeQuality #DeveloperProductivity

---

## How to Add These Posts

### Option 1: Using the script
```bash
npm run build
node scripts/add-linkedin-posts.js
```

### Option 2: Via Claude Desktop
Tell Claude:
```
Create two LinkedIn posts for MGC Calendar MCP:

Post 1: About OAuth frustration and simple solutions, scheduled for Jan 29 at 9am
Post 2: About testing journey from 0 to 78 tests, scheduled for Jan 31 at 10am

[Copy the content from above]
```

### Option 3: Manually in Dashboard
1. Open dashboard: http://localhost:3737
2. Click January 29 → Create event
3. Paste Post 1 content into Description field
4. Repeat for Post 2 on January 31

---

## Publishing Workflow

1. **Review in Dashboard:** Check both posts appear correctly
2. **When Ready to Post:**
   - Click the event in calendar
   - Click "📤 Post to LinkedIn" button
   - Content copies to clipboard
3. **On LinkedIn:**
   - Paste (Ctrl+V) into new post
   - Add any images if desired
   - Click "Post"
4. **Mark Complete:**
   - Return to dashboard
   - Check "Mark as published" ✓
   - Event turns purple

---

## Post Strategy

**Post 1 (Jan 29):** Targets developers frustrated with complexity - speaks to pain points, offers solution

**Post 2 (Jan 31):** Showcases professional development practices - appeals to quality-focused developers

Both posts:
- ✅ Under 1000 characters (LinkedIn sweet spot)
- ✅ Include relevant hashtags
- ✅ End with engagement question
- ✅ Link to GitHub repo
- ✅ Authentic personal story

---

## Expected Outcomes

**Post 1:**
- Resonates with developers tired of OAuth
- Drives traffic to GitHub
- Comments about similar frustrations
- Potential users who value simplicity

**Post 2:**
- Shows commitment to quality
- Attracts professional developers
- Demonstrates transparency
- Positions you as quality-focused developer

Both showcase different aspects of MGC Calendar and your development approach.
