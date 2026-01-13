/**
 * MGC Calendar MCP - ICS File Generator
 * 
 * Generates standard ICS (iCalendar) files for calendar events.
 * 
 * v1.1.0 adds:
 * - parseICS: Import events from ICS files
 * 
 * Output directory: ~/.mgc-calendar/ics-files/
 * 
 * Author: James Murrell (MGC)
 * License: MIT
 */

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

export function parseICS(icsContent: string): any[] {
  const events: any[] = [];
  
  // Split by BEGIN:VEVENT
  const eventBlocks = icsContent.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const endIndex = block.indexOf('END:VEVENT');
    if (endIndex === -1) continue;
    
    const eventData = block.substring(0, endIndex);
    const lines = eventData.split(/\r?\n/).filter(line => line.trim());
    
    const event: any = {
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      allDay: false
    };
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.substring(0, colonIndex).split(';')[0];
      const value = line.substring(colonIndex + 1).trim();
      
      switch (key) {
        case 'SUMMARY':
          event.title = value;
          break;
        case 'DESCRIPTION':
          event.description = value.replace(/\\n/g, '\n');
          break;
        case 'LOCATION':
          event.location = value;
          break;
        case 'DTSTART':
          const startParts = parseDateTimeValue(value);
          event.startDate = startParts.date;
          event.startTime = startParts.time;
          if (startParts.allDay) event.allDay = true;
          break;
        case 'DTEND':
          const endParts = parseDateTimeValue(value);
          event.endDate = endParts.date;
          event.endTime = endParts.time;
          break;
      }
    }
    
    if (event.title && event.startDate) {
      if (!event.endDate) event.endDate = event.startDate;
      events.push(event);
    }
  }
  
  return events;
}

function parseDateTimeValue(value: string): { date: string; time: string; allDay: boolean } {
  // Remove timezone info for simplicity
  const cleaned = value.replace(/Z$/, '').replace(/T.*Z/, '');
  
  if (cleaned.length === 8) {
    // YYYYMMDD format (all-day)
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    return { date: `${year}-${month}-${day}`, time: '', allDay: true };
  } else if (cleaned.length >= 15) {
    // YYYYMMDDTHHmmss format
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    const hour = cleaned.substring(9, 11);
    const minute = cleaned.substring(11, 13);
    return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}`, allDay: false };
  }
  
  return { date: '', time: '', allDay: false };
}
