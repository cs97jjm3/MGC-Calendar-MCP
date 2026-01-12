# Packaging MGC Calendar with Official MCPB Tools

## Official Way to Create MCPB Bundles

Anthropic provides the official `@anthropic-ai/mcpb` CLI tool for creating proper MCPB bundles.

## Setup

### 1. Install the MCPB CLI globally:
```bash
npm install -g @anthropic-ai/mcpb
```

### 2. Verify installation:
```bash
mcpb --version
```

## Creating the Bundle

### Option 1: Quick Pack (Recommended)

Since you already have a valid `manifest.json`, you can directly pack:

```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp

# Make sure project is built
npm run build

# Pack the bundle
mcpb pack . mgc-calendar-mcp.mcpb
```

This will:
- Validate your `manifest.json`
- Bundle all necessary files
- Include `node_modules` dependencies
- Create a proper `.mcpb` file

### Option 2: Interactive Setup (If Starting Fresh)

If you want to regenerate the manifest:

```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp

# Interactive manifest creation
mcpb init

# Follow the prompts:
# - Extension name: mgc-calendar
# - Author name: James Murrell (MGC)
# - Description: Universal calendar manager using ICS files
# - Entry point: build/index.js
# etc.

# Then pack
mcpb pack . mgc-calendar-mcp.mcpb
```

## What Gets Included

The `mcpb pack` command automatically includes:

```
mgc-calendar-mcp.mcpb (ZIP archive)
├── manifest.json          # Your manifest
├── build/                 # Compiled TypeScript
│   ├── index.js
│   ├── database.js
│   ├── ics-generator.js
│   ├── dashboard.js
│   └── types.js
├── dashboard/            # Dashboard HTML/assets
│   ├── index.html
│   └── mgc-logo.svg
├── node_modules/         # All dependencies bundled
├── package.json          # Package metadata
└── package-lock.json     # Dependency lock
```

**Automatically excludes:**
- `.git/` directory
- `src/` TypeScript source (only built JS included)
- Development files
- Test files
- Documentation markdown (unless specified)

## Validate Before Packing

Check your manifest is valid:

```bash
mcpb validate manifest.json
```

Should output:
```
✓ Manifest is valid
```

## Testing the Bundle

### 1. Inspect the bundle:
```bash
mcpb info mgc-calendar-mcp.mcpb
```

Shows:
- Bundle name and version
- Author
- Entry point
- Tools provided
- File size
- Dependencies

### 2. Install in Claude Desktop:

**Windows:**
1. Open Claude Desktop
2. Settings → Extensions → Advanced settings
3. Scroll to "Extension Developer"
4. Click "Install Extension..."
5. Select `mgc-calendar-mcp.mcpb`
6. Click "Install"

**Or double-click the .mcpb file** - Claude Desktop should handle it automatically

### 3. Verify tools appear:

Open a new Claude conversation and ask:
```
"What calendar tools do you have?"
```

Should list all 6 MGC Calendar tools.

## Bundle Size Optimization

The bundle includes all `node_modules`. To reduce size:

### 1. Check current size:
```bash
dir mgc-calendar-mcp.mcpb
```

### 2. Use production dependencies only:

Your current dependencies are already minimal and production-only:
- `@modelcontextprotocol/sdk`
- `better-sqlite3`
- `ical-generator`
- `zod`

No optimization needed - these are all essential.

### 3. If you want to exclude dev dependencies:

The `mcpb pack` command already excludes `devDependencies` by default.

## Updating the Bundle

When you make changes:

```bash
# 1. Update version in package.json and manifest.json
# Current: 1.0.1 → New: 1.0.2 (for example)

# 2. Rebuild
npm run build

# 3. Repack
mcpb pack . mgc-calendar-mcp.mcpb

# This overwrites the existing .mcpb file
```

## Publishing the Bundle

### For GitHub Releases:

```bash
# 1. Create git tag
git tag v1.0.1
git push origin v1.0.1

# 2. Create GitHub release
# - Go to https://github.com/cs97jjm3/mgc-calendar-mcp/releases
# - Click "Create a new release"
# - Select tag: v1.0.1
# - Attach mgc-calendar-mcp.mcpb file
# - Publish

# Users can then download the .mcpb file directly
```

### For Anthropic Extension Directory (Future):

When Anthropic opens the marketplace:

```bash
# They'll likely provide a submission process
# Your properly packed .mcpb file will be ready to submit
```

## Troubleshooting

### "Module not found" after installation

**Cause:** Dependencies not properly bundled  
**Fix:** 
```bash
# Ensure dependencies are in dependencies, not devDependencies
npm install --save @modelcontextprotocol/sdk better-sqlite3 ical-generator zod

# Repack
npm run build
mcpb pack . mgc-calendar-mcp.mcpb
```

### "Invalid manifest" error

**Fix:**
```bash
# Validate manifest
mcpb validate manifest.json

# Fix any errors shown
# Common issues:
# - Missing required fields
# - Invalid version format
# - Wrong entry_point path
```

### Bundle too large

**Check what's being included:**
```bash
# Unzip to inspect (Windows)
copy mgc-calendar-mcp.mcpb mgc-calendar-mcp.zip
tar -xf mgc-calendar-mcp.zip -C temp-extract

# Check size of each directory
```

**Common culprits:**
- `.git` directory (should be auto-excluded)
- Build artifacts in wrong location
- Extra files in project root

## Current vs Official Method

### What You Did Before:
- Created `.mcpb` file manually (possibly with zip tool)
- May not have proper structure
- May be missing dependencies

### What Official Tool Does:
✅ Validates manifest against spec  
✅ Bundles all dependencies correctly  
✅ Proper ZIP structure  
✅ Compatible with Claude Desktop  
✅ Follows MCPB specification exactly  

## Next Steps

1. **Install MCPB CLI:**
   ```bash
   npm install -g @anthropic-ai/mcpb
   ```

2. **Repack your bundle properly:**
   ```bash
   cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp
   npm run build
   mcpb pack . mgc-calendar-mcp.mcpb
   ```

3. **Test installation:**
   - Double-click the new `.mcpb` file
   - Or install via Claude Desktop Settings

4. **Update README** with official installation:
   ```markdown
   ## Installation
   
   1. Download `mgc-calendar-mcp.mcpb` from releases
   2. Double-click the file, or
   3. Claude Desktop → Settings → Extensions → Install Extension
   ```

5. **Delete old bundle** if it was created differently:
   ```bash
   # The old one might not work properly
   # Replace it with the properly packed version
   ```

## Documentation to Keep

- Keep `manifest.json` in root
- Keep README.md 
- Keep CHANGELOG.md
- Documentation is useful for developers but won't be in the bundle

## Summary

**Use the official tool:**
```bash
npm install -g @anthropic-ai/mcpb
mcpb pack . mgc-calendar-mcp.mcpb
```

**Not manual zip or other methods.** The official tool ensures compatibility with Claude Desktop and future MCPB hosts.
