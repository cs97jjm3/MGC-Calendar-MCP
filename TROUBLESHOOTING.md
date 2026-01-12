# MGC Calendar MCP - Troubleshooting Guide

## Installation Issues

### Problem: Extension doesn't show up in Claude Desktop

**Check these things:**

1. **Verify Claude Desktop config location:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Check your config syntax:**
   ```json
   {
     "mcpServers": {
       "mgc-calendar": {
         "command": "node",
         "args": ["C:\\FULL\\PATH\\TO\\mgc-calendar-mcp\\build\\index.js"]
       }
     }
   }
   ```

3. **Common config mistakes:**
   - ❌ Wrong path separators: Use `\\` on Windows, `/` on Mac/Linux
   - ❌ Relative paths: Must be absolute path
   - ❌ Missing quotes: Path must be in quotes
   - ❌ Wrong file: Should point to `build/index.js`, not `src/index.ts`

4. **Verify the build exists:**
   ```bash
   # Check if build directory exists
   dir C:\Users\murre\Documents\GitHub\mgc-calendar-mcp\build
   
   # Should see: index.js, database.js, ics-generator.js, dashboard.js, types.js
   ```

5. **Rebuild if needed:**
   ```bash
   cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
   npm run build
   ```

6. **Restart Claude Desktop completely:**
   - Quit Claude Desktop (File → Quit, not just close window)
   - Wait 5 seconds
   - Reopen Claude Desktop

### Problem: "Module not found" errors

**Solution:**
```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
npm install
npm run build
```

### Problem: Extension shows but tools don't work

**Check the logs:**

1. **Windows - View Claude Desktop logs:**
   ```
   %APPDATA%\Claude\logs\
   ```

2. **Look for MGC Calendar errors:**
   - Open latest log file
   - Search for "mgc-calendar" or "MGC Calendar"
   - Look for error messages

3. **With improved logging (v1.0.1), you'll see:**
   ```
   [2026-01-12T10:30:00.000Z] [INFO] MGC Calendar MCP Server starting...
   [2026-01-12T10:30:00.001Z] [INFO] Node version: v20.x.x
   [2026-01-12T10:30:00.002Z] [INFO] Platform: win32
   [2026-01-12T10:30:00.003Z] [INFO] Database directory: C:\Users\...\\.mgc-calendar
   [2026-01-12T10:30:00.004Z] [INFO] Server ready to receive tool calls
   ```

4. **If you see errors about missing directories:**
   - The server should create them automatically
   - If not, manually create: `C:\Users\YourName\.mgc-calendar\ics-files`

## Tool-Specific Issues

### create_event tool fails

**Symptoms:**
- Event doesn't create
- Error about database

**Debug steps:**
1. Check database directory exists: `C:\Users\YourName\.mgc-calendar`
2. Check database file exists: `events.db`
3. Check you have write permissions to that directory
4. Look in logs for "Creating event" message

**Manual fix:**
```bash
# Delete and recreate database
del C:\Users\YourName\.mgc-calendar\events.db
# Server will recreate on next event creation
```

### launch_dashboard fails

**Symptoms:**
- Dashboard doesn't open
- Browser doesn't launch
- Port 3737 error

**Debug steps:**

1. **Check if dashboard.js exists:**
   ```bash
   dir C:\Users\murre\Documents\GitHub\mgc-calendar-mcp\build\dashboard.js
   ```

2. **Check if port 3737 is already in use:**
   ```bash
   netstat -ano | findstr :3737
   ```
   
   If something is using it:
   ```bash
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

3. **Manually start dashboard:**
   ```bash
   cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
   npm run dashboard
   ```
   
   Then open: http://localhost:3737

4. **Check firewall isn't blocking:**
   - Windows may ask for firewall permission
   - Allow Node.js through firewall

### ICS files not generating

**Symptoms:**
- Event creates but no ICS file
- Can't find ICS files

**Check:**
1. ICS directory exists: `C:\Users\YourName\.mgc-calendar\ics-files\`
2. Files are there but hidden: `attrib C:\Users\YourName\.mgc-calendar\ics-files\*.*`
3. Check logs for "ICS file generated" message

## Viewing Detailed Logs

### With v1.0.1 (Improved Logging)

The server now logs everything to stderr, which Claude Desktop captures.

**What's logged:**
- Server startup info (Node version, platform, paths)
- Directory creation/verification
- Every tool call with arguments
- Every database operation
- Every ICS file generation
- All errors with full details

**How to view:**

1. **Windows:**
   ```
   notepad %APPDATA%\Claude\logs\mcp-server-mgc-calendar.log
   ```

2. **Look for these patterns:**
   - `[INFO]` - Normal operations
   - `[WARN]` - Warnings (event not found, etc.)
   - `[ERROR]` - Actual errors
   - `[DEBUG]` - Detailed debugging info

3. **Example log output:**
   ```
   [2026-01-12T10:30:15.123Z] [INFO] Tool called: create_event {"title":"Test Event","startDate":"2026-01-15"}
   [2026-01-12T10:30:15.124Z] [DEBUG] Creating event {"title":"Test Event","startDate":"2026-01-15"}
   [2026-01-12T10:30:15.125Z] [INFO] Event created with ID: 1
   [2026-01-12T10:30:15.126Z] [INFO] ICS file generated: C:\Users\...\\.mgc-calendar\ics-files\mgc-event-123.ics
   ```

## Common Error Messages

### "Database is locked"
**Cause:** Another process has the database open  
**Fix:** Close any other MGC Calendar processes or restart Claude Desktop

### "Permission denied"
**Cause:** Can't write to .mgc-calendar directory  
**Fix:** Check folder permissions or run as administrator

### "Module not found: better-sqlite3"
**Cause:** Dependencies not installed  
**Fix:** Run `npm install` in project directory

### "Cannot find module 'dashboard.js'"
**Cause:** Project not built  
**Fix:** Run `npm run build`

### "EADDRINUSE: address already in use :::3737"
**Cause:** Dashboard already running or port in use  
**Fix:** Kill the process using port 3737 or restart computer

## Getting Help

### Before opening an issue:

1. **Check the logs** - Look for ERROR messages
2. **Verify installation** - Run through setup steps again
3. **Test Node.js** - Run `node --version` (should be 16+)
4. **Test the build** - Run `npm run build` successfully
5. **Collect this info:**
   - Operating system and version
   - Node.js version
   - Claude Desktop version
   - Full error message from logs
   - What you were trying to do when it failed

### Where to get help:

- **GitHub Issues:** https://github.com/cs97jjm3/mgc-calendar-mcp/issues
- **Include:**
  - Relevant log snippets
  - Your config (with paths redacted if sensitive)
  - Steps to reproduce the problem

## Manual Testing

### Test the MCP server directly:

```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
node build/index.js
```

You should see:
```
[2026-01-12T10:30:00.000Z] [INFO] MGC Calendar MCP Server starting...
[2026-01-12T10:30:00.010Z] [INFO] Server ready to receive tool calls
```

Press Ctrl+C to stop.

### Test database directly:

```bash
# Requires sqlite3 command-line tool
sqlite3 C:\Users\YourName\.mgc-calendar\events.db "SELECT * FROM events;"
```

### Test dashboard directly:

```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
npm run dashboard
```

Then open: http://localhost:3737

## Still Having Issues?

If none of this helps:

1. **Delete everything and start fresh:**
   ```bash
   # Backup if you have events you want to keep
   copy C:\Users\YourName\.mgc-calendar\events.db backup-events.db
   
   # Delete MGC Calendar data
   rmdir /s C:\Users\YourName\.mgc-calendar
   
   # Reinstall
   cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
   del /s /q node_modules build
   npm install
   npm run build
   ```

2. **Open a detailed GitHub issue with:**
   - Full log output (first 50 lines showing startup)
   - Your exact config (redact personal paths)
   - Steps you took
   - What you expected vs what happened

## Version Info

This troubleshooting guide is for:
- MGC Calendar MCP v1.0.1+
- Claude Desktop 1.0.0+
- Node.js 16.0.0+

If you're using an older version, update first:
```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
git pull
npm install
npm run build
```
