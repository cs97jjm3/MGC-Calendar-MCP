import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createEvent, getEvent, listEvents, updateEvent, deleteEvent, ensureDb, closeDatabase } from '../../src/database.js';
import type { CreateEventInput } from '../../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use a test database
const testDbPath = join(__dirname, '..', 'test-data', 'test-events.db');

describe('Event Management', () => {
  beforeEach(async () => {
    // Clean up test database before each test
    const testDataDir = join(__dirname, '..', 'test-data');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDataDir, { recursive: true });
    
    // Initialize database
    await ensureDb();
  });

  afterEach(async () => {
    // Clean up - don't close database, just clean data
    // Closing causes issues with the singleton pattern in database.ts
    try {
      const events = listEvents();
      for (const event of events) {
        deleteEvent(event.id);
      }
    } catch (e) {
      // If database errors, proceed with cleanup
    }
  });

  describe('createEvent', () => {
    it('should create and retrieve an event', () => {
      const input: CreateEventInput = {
        title: 'Test Event',
        startDate: '2026-02-01',
        description: 'Test description',
        location: 'Test location'
      };
      
      const event = createEvent(input);
      
      expect(event.id).toBeDefined();
      expect(event.title).toBe('Test Event');
      expect(event.startDate).toBe('2026-02-01');
      expect(event.description).toBe('Test description');
      expect(event.location).toBe('Test location');
      expect(event.uid).toMatch(/^mgc-event-/);
      
      const retrieved = getEvent(event.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(event.id);
      expect(retrieved?.title).toBe(event.title);
    });

    it('should create an all-day event', () => {
      const input: CreateEventInput = {
        title: 'All Day Event',
        startDate: '2026-02-15',
        allDay: true
      };
      
      const event = createEvent(input);
      
      expect(event.allDay).toBe(true);
      expect(event.startTime).toBe('');
      expect(event.endTime).toBe('');
    });

    it('should create a timed event', () => {
      const input: CreateEventInput = {
        title: 'Timed Event',
        startDate: '2026-02-20',
        startTime: '14:00',
        endTime: '15:30'
      };
      
      const event = createEvent(input);
      
      expect(event.allDay).toBe(false);
      expect(event.startTime).toBe('14:00');
      expect(event.endTime).toBe('15:30');
    });

    it('should auto-populate endDate if not provided', () => {
      const input: CreateEventInput = {
        title: 'Event Without End Date',
        startDate: '2026-03-01'
      };
      
      const event = createEvent(input);
      
      expect(event.endDate).toBe('2026-03-01');
    });

    it('should create event with tags', () => {
      const input: CreateEventInput = {
        title: 'LinkedIn Post Event',
        startDate: '2026-03-05',
        tags: 'LinkedIn,Personal'
      };
      
      const event = createEvent(input);
      
      expect(event.tags).toBe('LinkedIn,Personal');
    });

    it('should default status to scheduled', () => {
      const input: CreateEventInput = {
        title: 'New Event',
        startDate: '2026-03-10'
      };
      
      const event = createEvent(input);
      
      expect(event.status).toBe('scheduled');
      expect(event.publishedDate).toBeNull();
    });
  });

  describe('listEvents', () => {
    it('should return empty array when no events exist', () => {
      const events = listEvents();
      expect(events).toEqual([]);
    });

    it('should list events in descending date order', () => {
      createEvent({ title: 'Event 1', startDate: '2026-02-01' });
      createEvent({ title: 'Event 2', startDate: '2026-02-15' });
      createEvent({ title: 'Event 3', startDate: '2026-02-10' });
      
      const events = listEvents();
      
      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('Event 2'); // Most recent first
      expect(events[1].title).toBe('Event 3');
      expect(events[2].title).toBe('Event 1');
    });

    it('should list events with all properties', () => {
      const input: CreateEventInput = {
        title: 'Complete Event',
        description: 'Full description',
        location: 'Test Location',
        startDate: '2026-03-01',
        startTime: '10:00',
        endDate: '2026-03-01',
        endTime: '11:00',
        tags: 'Meeting',
        status: 'scheduled'
      };
      
      createEvent(input);
      
      const events = listEvents();
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Complete Event');
      expect(events[0].description).toBe('Full description');
      expect(events[0].location).toBe('Test Location');
      expect(events[0].tags).toBe('Meeting');
    });
  });

  describe('getEvent', () => {
    it('should return null for non-existent event', () => {
      const event = getEvent(999);
      expect(event).toBeNull();
    });

    it('should retrieve event by ID', () => {
      const created = createEvent({ title: 'Test', startDate: '2026-02-01' });
      const retrieved = getEvent(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test');
    });
  });

  describe('updateEvent', () => {
    it('should return null for non-existent event', () => {
      const updated = updateEvent({ id: 999, title: 'New Title' });
      expect(updated).toBeNull();
    });

    it('should update event title', () => {
      const created = createEvent({ title: 'Original', startDate: '2026-02-01' });
      const updated = updateEvent({ id: created.id, title: 'Updated' });
      
      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated');
      expect(updated?.startDate).toBe('2026-02-01'); // Other fields unchanged
    });

    it('should update multiple fields', () => {
      const created = createEvent({ 
        title: 'Original', 
        startDate: '2026-02-01',
        description: 'Old description'
      });
      
      const updated = updateEvent({ 
        id: created.id, 
        title: 'Updated Title',
        description: 'New description',
        location: 'New Location'
      });
      
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.description).toBe('New description');
      expect(updated?.location).toBe('New Location');
    });

    it('should update tags and status', () => {
      const created = createEvent({ title: 'Test', startDate: '2026-02-01' });
      
      const updated = updateEvent({ 
        id: created.id, 
        tags: 'LinkedIn,Meeting',
        status: 'published'
      });
      
      expect(updated?.tags).toBe('LinkedIn,Meeting');
      expect(updated?.status).toBe('published');
    });

    it('should update timestamp on modification', () => {
      const created = createEvent({ title: 'Test', startDate: '2026-02-01' });
      const originalUpdatedAt = created.updatedAt;
      
      // Wait a moment to ensure timestamp changes
      setTimeout(() => {
        const updated = updateEvent({ id: created.id, title: 'Modified' });
        expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
      }, 100);
    });
  });

  describe('deleteEvent', () => {
    it('should return null for non-existent event', () => {
      const deleted = deleteEvent(999);
      expect(deleted).toBeNull();
    });

    it('should delete event and return deleted event data', () => {
      const created = createEvent({ title: 'To Delete', startDate: '2026-02-01' });
      const deleted = deleteEvent(created.id);
      
      expect(deleted).toBeDefined();
      expect(deleted?.id).toBe(created.id);
      expect(deleted?.title).toBe('To Delete');
      
      // Verify event is actually deleted
      const retrieved = getEvent(created.id);
      expect(retrieved).toBeNull();
    });

    it('should remove event from list', () => {
      createEvent({ title: 'Event 1', startDate: '2026-02-01' });
      const event2 = createEvent({ title: 'Event 2', startDate: '2026-02-02' });
      createEvent({ title: 'Event 3', startDate: '2026-02-03' });
      
      let events = listEvents();
      expect(events).toHaveLength(3);
      
      deleteEvent(event2.id);
      
      events = listEvents();
      expect(events).toHaveLength(2);
      expect(events.find(e => e.id === event2.id)).toBeUndefined();
    });
  });

  describe('UID generation', () => {
    it('should generate unique UIDs for each event', () => {
      const event1 = createEvent({ title: 'Event 1', startDate: '2026-02-01' });
      const event2 = createEvent({ title: 'Event 2', startDate: '2026-02-02' });
      
      expect(event1.uid).not.toBe(event2.uid);
      expect(event1.uid).toMatch(/^mgc-event-\d+-[a-z0-9]+@mgc-calendar$/);
      expect(event2.uid).toMatch(/^mgc-event-\d+-[a-z0-9]+@mgc-calendar$/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings for optional fields', () => {
      const event = createEvent({ 
        title: 'Test',
        startDate: '2026-02-01',
        description: '',
        location: ''
      });
      
      expect(event.description).toBe('');
      expect(event.location).toBe('');
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(500);
      const event = createEvent({ title: longTitle, startDate: '2026-02-01' });
      
      expect(event.title).toBe(longTitle);
    });

    it('should handle special characters in titles', () => {
      const specialTitle = 'Event with "quotes" and \'apostrophes\' & symbols!';
      const event = createEvent({ title: specialTitle, startDate: '2026-02-01' });
      
      expect(event.title).toBe(specialTitle);
    });
  });
});
