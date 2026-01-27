/**
 * MGC Calendar MCP - ICS Generator Tests
 * 
 * Unit tests for ICS file generation and parsing.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { generateICS, parseICS, getOutputDirectory } from '../src/ics-generator.js';
import type { CalendarEvent } from '../src/types.js';

const TEST_ICS_DIR = join(process.cwd(), '.test-mgc-calendar', 'ics-files');

describe('ICS Generator', () => {
  beforeEach(() => {
    // Set test paths
    process.env.HOME = process.cwd();
    process.env.USERPROFILE = process.cwd();

    // Clean up and create test directory
    if (existsSync(TEST_ICS_DIR)) {
      rmSync(TEST_ICS_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_ICS_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(TEST_ICS_DIR)) {
      rmSync(TEST_ICS_DIR, { recursive: true, force: true });
    }
  });

  describe('Generate ICS', () => {
    it('should generate ICS file for simple event', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'test-uid-123@mgc-calendar',
        title: 'Test Event',
        description: '',
        location: '',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '',
        endTime: '',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const icsPath = generateICS(event);

      expect(existsSync(icsPath)).toBe(true);
      expect(icsPath).toContain('test-uid-123@mgc-calendar.ics');

      const content = readFileSync(icsPath, 'utf-8');
      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('BEGIN:VEVENT');
      expect(content).toContain('SUMMARY:Test Event');
      expect(content).toContain('UID:test-uid-123@mgc-calendar');
      expect(content).toContain('END:VEVENT');
      expect(content).toContain('END:VCALENDAR');
    });

    it('should generate ICS with all fields', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'full-event@mgc-calendar',
        title: 'Complete Event',
        description: 'Event description here',
        location: 'Conference Room A',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '09:00',
        endTime: '10:00',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const icsPath = generateICS(event);
      const content = readFileSync(icsPath, 'utf-8');

      expect(content).toContain('SUMMARY:Complete Event');
      expect(content).toContain('DESCRIPTION:Event description here');
      expect(content).toContain('LOCATION:Conference Room A');
    });

    it('should generate ICS for all-day event', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'allday-event@mgc-calendar',
        title: 'All Day Event',
        description: '',
        location: '',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '',
        endTime: '',
        allDay: true,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const icsPath = generateICS(event);
      const content = readFileSync(icsPath, 'utf-8');

      expect(content).toContain('SUMMARY:All Day Event');
      // All-day events shouldn't have specific times
      expect(content).toMatch(/DTSTART[;:].*2026/);
    });

    it('should generate cancellation ICS', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'cancelled-event@mgc-calendar',
        title: 'Cancelled Event',
        description: '',
        location: '',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '09:00',
        endTime: '10:00',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const icsPath = generateICS(event, 'CANCELLED');
      const content = readFileSync(icsPath, 'utf-8');

      expect(content).toContain('STATUS:CANCELLED');
      expect(content).toContain('UID:cancelled-event@mgc-calendar');
    });

    it('should handle special characters in fields', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'special-chars@mgc-calendar',
        title: 'Event & Title "with" \'quotes\'',
        description: 'Line 1\nLine 2\nLine 3',
        location: 'Room #5',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '',
        endTime: '',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const icsPath = generateICS(event);
      
      // Should not throw error
      expect(existsSync(icsPath)).toBe(true);
    });

    it('should preserve UID across multiple generations', () => {
      const event: CalendarEvent = {
        id: 1,
        uid: 'persistent-uid@mgc-calendar',
        title: 'Original Title',
        description: '',
        location: '',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '',
        endTime: '',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      const path1 = generateICS(event);
      const content1 = readFileSync(path1, 'utf-8');

      // Update title and regenerate
      event.title = 'Updated Title';
      const path2 = generateICS(event);
      const content2 = readFileSync(path2, 'utf-8');

      // UID should be the same
      expect(content1).toContain('UID:persistent-uid@mgc-calendar');
      expect(content2).toContain('UID:persistent-uid@mgc-calendar');
      
      // Title should be different
      expect(content1).toContain('SUMMARY:Original Title');
      expect(content2).toContain('SUMMARY:Updated Title');
      
      // Path should be the same (overwrites file)
      expect(path1).toBe(path2);
    });
  });

  describe('Get Output Directory', () => {
    it('should return correct output directory path', () => {
      const dir = getOutputDirectory();
      
      expect(dir).toBeDefined();
      // Directory will be .mgc-calendar or .test-mgc-calendar depending on env
      expect(dir).toContain('ics-files');
      expect(dir).toMatch(/\..*mgc-calendar/);
    });
  });

  describe('Parse ICS', () => {
    it('should parse simple ICS content', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260201
DTEND:20260201
SUMMARY:Test Event
DESCRIPTION:Test description
LOCATION:Test location
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Test Event');
      expect(events[0].startDate).toBe('2026-02-01');
      expect(events[0].description).toBe('Test description');
      expect(events[0].location).toBe('Test location');
    });

    it('should parse ICS with time', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260201T090000
DTEND:20260201T100000
SUMMARY:Timed Event
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events).toHaveLength(1);
      expect(events[0].startDate).toBe('2026-02-01');
      expect(events[0].startTime).toBe('09:00');
      expect(events[0].endTime).toBe('10:00');
    });

    it('should parse multiple events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260201
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
DTSTART:20260215
SUMMARY:Event 2
END:VEVENT
BEGIN:VEVENT
DTSTART:20260301
SUMMARY:Event 3
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('Event 1');
      expect(events[1].title).toBe('Event 2');
      expect(events[2].title).toBe('Event 3');
    });

    it('should handle all-day events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260201
SUMMARY:All Day
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events).toHaveLength(1);
      expect(events[0].allDay).toBe(true);
      expect(events[0].startTime).toBe('');
    });

    it('should handle newlines in description', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260201
SUMMARY:Event
DESCRIPTION:Line 1\\nLine 2\\nLine 3
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events[0].description).toContain('\n');
      expect(events[0].description.split('\n')).toHaveLength(3);
    });

    it('should skip malformed events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:No Date Event
DESCRIPTION:This event has no date and should be skipped
END:VEVENT
BEGIN:VEVENT
DTSTART:20260201
SUMMARY:Valid Event
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      // Should only parse the valid event
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Valid Event');
    });

    it('should handle empty calendar', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events).toHaveLength(0);
    });

    it('should default endDate to startDate if not provided', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260201
SUMMARY:Event Without End Date
END:VEVENT
END:VCALENDAR`;

      const events = parseICS(icsContent);

      expect(events[0].startDate).toBe('2026-02-01');
      expect(events[0].endDate).toBe('2026-02-01');
    });
  });

  describe('Round Trip (Generate and Parse)', () => {
    it('should preserve data through generate -> parse cycle', () => {
      const originalEvent: CalendarEvent = {
        id: 1,
        uid: 'roundtrip@mgc-calendar',
        title: 'Round Trip Event',
        description: 'Test description',
        location: 'Test location',
        startDate: '2026-02-01',
        endDate: '2026-02-01',
        startTime: '09:00',
        endTime: '10:00',
        allDay: false,
        content: '',
        tags: '',
        status: 'scheduled',
        publishedDate: null,
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z'
      };

      // Generate ICS
      const icsPath = generateICS(originalEvent);
      const icsContent = readFileSync(icsPath, 'utf-8');

      // Parse it back
      const parsedEvents = parseICS(icsContent);

      expect(parsedEvents).toHaveLength(1);
      expect(parsedEvents[0].title).toBe(originalEvent.title);
      expect(parsedEvents[0].description).toBe(originalEvent.description);
      expect(parsedEvents[0].location).toBe(originalEvent.location);
      expect(parsedEvents[0].startDate).toBe(originalEvent.startDate);
      expect(parsedEvents[0].startTime).toBe(originalEvent.startTime);
    });
  });
});
