import ical, { ICalEventData } from 'ical-generator';
import fs from 'fs';
import path from 'path';
import type { CalendarEvent } from './types.js';

const outputDir = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.mgc-calendar', 'ics-files');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function parseDateTime(date: string, time: string): Date {
  if (!time) {
    // All-day event
    return new Date(date);
  }
  
  const dateTimeStr = `${date}T${time}`;
  return new Date(dateTimeStr);
}

export function generateICS(event: CalendarEvent, eventStatus: 'CONFIRMED' | 'CANCELLED' = 'CONFIRMED'): string {
  const calendar = ical({ name: 'MGC Calendar' });

  const startDateTime = parseDateTime(event.startDate, event.startTime);
  const endDateTime = parseDateTime(event.endDate, event.endTime);

  const eventData: ICalEventData = {
    start: startDateTime,
    end: endDateTime,
    summary: event.title,
    description: event.description,
    location: event.location,
    allDay: event.allDay
  };

  const icalEvent = calendar.createEvent(eventData);
  
  // Set UID and status separately
  icalEvent.id(event.uid);
  icalEvent.status(eventStatus as any);

  const icsContent = calendar.toString();
  const filename = `${event.uid}.ics`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, icsContent);

  return filepath;
}

export function getOutputDirectory(): string {
  return outputDir;
}
