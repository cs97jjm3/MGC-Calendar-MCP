# MGC Calendar MCP - Testing Quick Start

This guide shows you how to use the new test suite.

## Installation

1. **Copy the test files to your project:**
```bash
cd C:\Users\murre\Documents\GitHub\mgc-calendar-mcp

# Copy tests directory
xcopy /E /I tests tests

# Copy vitest config
copy vitest.config.ts vitest.config.ts
```

2. **Verify dependencies are installed:**
```bash
npm install
```

Your `package.json` already has:
- vitest@^2.1.8
- @vitest/coverage-v8@^2.1.8

## Running Tests

### Run all tests (quick check)
```bash
npm test
```

Expected output:
```
✓ tests/database.test.ts (51 tests)
✓ tests/ics-generator.test.ts (30 tests)

Test Files  2 passed (2)
     Tests  81 passed (81)
  Duration  2.5s
```

### Watch mode (for development)
```bash
npm run test:watch
```

This runs tests automatically when you save files. Great for TDD.

### With coverage report
```bash
npm run test:coverage
```

Generates HTML coverage report at `coverage/index.html`

## Test Structure

### Database Tests (`tests/database.test.ts`)

Tests all database operations:
- ✅ Event creation, reading, updating, deleting
- ✅ UID generation and uniqueness
- ✅ Tag suggestions
- ✅ Import/export functionality
- ✅ Mark as published
- ✅ Edge cases (special characters, long content, etc.)

### ICS Generator Tests (`tests/ics-generator.test.ts`)

Tests ICS file generation:
- ✅ ICS file creation
- ✅ All-day events
- ✅ Timed events
- ✅ Cancellation files
- ✅ ICS parsing
- ✅ Round-trip (generate → parse → verify)

## Writing New Tests

### Adding a database test

```typescript
// In tests/database.test.ts

it('should do something specific', () => {
  // Create test data
  const event = createEvent({
    title: 'Test Event',
    startDate: '2026-02-01'
  });

  // Perform action
  const result = updateEvent({
    id: event.id,
    title: 'Updated Title'
  });

  // Assert expectations
  expect(result?.title).toBe('Updated Title');
});
```

### Adding an ICS test

```typescript
// In tests/ics-generator.test.ts

it('should generate valid ICS', () => {
  const event: CalendarEvent = {
    // ... event properties
  };

  const icsPath = generateICS(event);
  const content = readFileSync(icsPath, 'utf-8');

  expect(content).toContain('BEGIN:VCALENDAR');
  expect(content).toContain('SUMMARY:Test Event');
});
```

## Common Issues

### Port 3737 in use during tests
Tests create a temporary test database, not the dashboard. If you see port errors, close any running dashboard instances.

### "Database not initialized" errors
The tests handle database initialization automatically. If you see this error, check that you're calling `await ensureDb()` before database operations.

### Tests fail on Windows path issues
The tests use Node.js path functions that work cross-platform. If you see path errors, check that you're using `join()` from `path` module, not string concatenation.

## Coverage Goals

Current coverage targets:
- **database.ts**: 90%+ (critical path)
- **ics-generator.ts**: 85%+ (ICS standard compliance)
- **types.ts**: 100% (type definitions)

Dashboard and MCP server (index.ts) are excluded from coverage as they're tested through integration/manual testing.

## CI/CD (Future)

When you set up GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Run tests before committing**
   ```bash
   npm test
   ```

2. **Write tests for new features**
   - Add test before implementing feature (TDD)
   - Verify test fails
   - Implement feature
   - Verify test passes

3. **Keep tests fast**
   - Use in-memory database
   - Avoid unnecessary delays
   - Mock external dependencies

4. **Test edge cases**
   - Empty strings
   - Special characters
   - Long content
   - Invalid inputs
   - Non-existent IDs

5. **Use descriptive test names**
   - ✅ `should create an event with all fields`
   - ❌ `test1`

## Troubleshooting

### All tests fail with "Module not found"
```bash
npm run build
```

### Tests pass locally but fail in CI
Check Node.js version matches (16+)

### Coverage too low
Add tests for uncovered lines shown in coverage report

### Tests timeout
Increase timeout in vitest.config.ts:
```typescript
testTimeout: 20000 // 20 seconds
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- Project ARCHITECTURE.md (explains what each module does)

---

**Next Steps:**
1. Run `npm test` to verify installation
2. Run `npm run test:coverage` to see coverage report
3. Add tests for any new features you build
4. Keep test coverage above 85%

Happy testing! 🎉
