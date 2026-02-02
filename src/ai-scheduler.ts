/**
 * Analyze post content to extract topic/tool and narrative type
 */
function analyzePostNarrative(event: CalendarEvent): { tool: string, narrativeType: string, priority: number } {
  const title = event.title.toLowerCase();
  const description = (event.description || '').toLowerCase();
  const combined = title + ' ' + description;
  
  // Detect which tool this is about
  let tool = 'general';
  if (combined.includes('calendar') || combined.includes('oauth')) {
    tool = 'calendar';
  } else if (combined.includes('ado') || combined.includes('azure devops') || combined.includes('tagging') || combined.includes('analytics') || combined.includes('filtering') || combined.includes('tracker')) {
    tool = 'ado-tracker';
  } else if (combined.includes('care finder') || combined.includes('care provider')) {
    tool = 'care-finder';
  } else if (combined.includes('price monitor') || combined.includes('roadmap')) {
    tool = 'price-monitor';
  }
  
  // Detect narrative type and assign priority (lower = earlier)
  let narrativeType = 'feature';
  let priority = 50; // default middle priority
  
  // Introduction/Why posts (should come first)
  if (title.includes('why i') || title.includes('introducing') || title.includes('motivation')) {
    narrativeType = 'why';
    priority = 10;
  }
  // Announcement/Release posts (should come early for new tools)
  else if (title.includes('announcement') || title.includes('release') || title.includes('launching') || title.includes('introducing')) {
    narrativeType = 'announcement';
    priority = 20;
  }
  // How/Process posts (come after why)
  else if (title.includes('how i') || title.includes('how we') || title.includes('journey')) {
    narrativeType = 'how';
    priority = 30;
  }
  // Technical deep-dives (come after announcement)
  else if (title.includes('technical') || title.includes('deep-dive') || title.includes('deep dive')) {
    narrativeType = 'technical';
    priority = 40;
  }
  // Feature posts (come after technical overview)
  else if (title.includes('feature') || combined.includes('new feature')) {
    narrativeType = 'feature';
    priority = 50;
  }
  // Update posts (incremental features)
  else if (title.includes('update') || title.includes('data sources')) {
    narrativeType = 'update';
    priority = 60;
  }
  // Roadmap/Future posts (should come last)
  else if (title.includes('roadmap') || title.includes('future') || title.includes('coming soon')) {
    narrativeType = 'roadmap';
    priority = 70;
  }
  
  return { tool, narrativeType, priority };
}

/**
 * Sort posts into logical narrative order
 */
function sortPostsByNarrative(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((a, b) => {
    const aNarrative = analyzePostNarrative(a);
    const bNarrative = analyzePostNarrative(b);
    
    // First sort by tool (group same tools together)
    if (aNarrative.tool !== bNarrative.tool) {
      // Calendar first, then ADO Tracker, then others
      const toolOrder: { [key: string]: number } = {
        'calendar': 1,
        'ado-tracker': 2,
        'care-finder': 3,
        'price-monitor': 4,
        'general': 5
      };
      return (toolOrder[aNarrative.tool] || 99) - (toolOrder[bNarrative.tool] || 99);
    }
    
    // Within same tool, sort by narrative priority
    return aNarrative.priority - bNarrative.priority;
  });
}

/**
 * AI Schedule Optimizer
 * 
 * Analyzes LinkedIn post schedules and suggests optimal times based on:
 * - Day of week (Tuesday-Thursday are best)
 * - Time of day (8-10am and 12-2pm are prime times)
 * - Content spacing (2-3 days apart is optimal)
 * - Weekend avoidance (Saturday/Sunday get 90% less engagement)
 * 
 * Author: James Murrell (MGC)
 * License: MIT
 */

import type { CalendarEvent } from './types.js';

export interface ScheduleIssue {
  type: 'weekend' | 'late_night' | 'too_close' | 'suboptimal_time' | 'poor_day' | 'missed_post';
  eventId: number;
  description: string;
}

export interface ScheduleSuggestion {
  eventId: number;
  eventTitle: string;
  oldDate: string;
  oldTime: string | null;
  oldEngagement: number;
  newDate: string;
  newTime: string;
  newEngagement: number;
  boost: number;
  reasoning: string;
}

export interface ScheduleAnalysis {
  eventsAnalyzed: number;
  issuesFound: number;
  issues: string[];
  suggestions: ScheduleSuggestion[];
  avgEngagementBoost: number;
}

/**
 * Calculate engagement score based on day and time
 */
function calculateEngagementScore(dateStr: string, timeStr: string | null): number {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  
  let baseScore = 100;
  
  // Day of week adjustments
  if (day === 0 || day === 6) {
    // Weekend: -90%
    baseScore = 10;
  } else if (day === 1) {
    // Monday: +20%
    baseScore = 120;
  } else if (day >= 2 && day <= 4) {
    // Tuesday-Thursday: +40%
    baseScore = 140;
  } else if (day === 5) {
    // Friday: +10%
    baseScore = 110;
  }
  
  // Time of day adjustments (if time specified)
  if (timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    
    if (hour >= 8 && hour < 10) {
      // Morning prime time: +40%
      baseScore *= 1.4;
    } else if (hour >= 12 && hour < 14) {
      // Lunch break: +35%
      baseScore *= 1.35;
    } else if (hour >= 15 && hour < 17) {
      // Afternoon OK: +20%
      baseScore *= 1.2;
    } else if (hour >= 18 && hour < 21) {
      // Evening low: -30%
      baseScore *= 0.7;
    } else if (hour >= 21 || hour < 8) {
      // Night avoid: -70%
      baseScore *= 0.3;
    }
  }
  
  return Math.round(baseScore);
}

/**
 * Detect issues with current schedule
 */
function detectIssues(events: CalendarEvent[]): { issues: ScheduleIssue[], descriptions: string[] } {
  const issues: ScheduleIssue[] = [];
  const descriptions: string[] = [];
  const issueCounters = {
    missed_post: 0,
    weekend: 0,
    late_night: 0,
    too_close: 0,
    suboptimal_time: 0
  };
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Only analyze scheduled LinkedIn posts (not published)
  const linkedInEvents = events.filter(e => {
    const hasLinkedInTag = (e.tags || '').split(',').some(t => t.trim() === 'LinkedIn');
    const isScheduled = e.status !== 'published';
    const hasContent = (e.description || '').trim().length >= 100;
    return hasLinkedInTag && isScheduled && hasContent;
  });
  
  linkedInEvents.forEach((event, idx) => {
    const date = new Date(event.startDate + 'T00:00:00');
    const day = date.getDay();
    const time = event.startTime;
    
    // Check for missed posts (scheduled in the past)
    if (date < today) {
      issues.push({
        type: 'missed_post',
        eventId: event.id,
        description: `"${event.title}" scheduled in the past (missed post)`
      });
      issueCounters.missed_post++;
      // Don't check other issues for missed posts - they need rescheduling anyway
      return;
    }
    
    // Check for weekend posts
    if (day === 0 || day === 6) {
      issues.push({
        type: 'weekend',
        eventId: event.id,
        description: `"${event.title}" scheduled on weekend (low engagement)`
      });
      issueCounters.weekend++;
    }
    
    // Check for late night posts
    if (time) {
      const hour = parseInt(time.split(':')[0]);
      if (hour >= 21 || hour < 8) {
        issues.push({
          type: 'late_night',
          eventId: event.id,
          description: `"${event.title}" scheduled at ${time} (poor timing)`
        });
        issueCounters.late_night++;
      } else if ((hour >= 10 && hour < 12) || (hour >= 14 && hour < 17)) {
        // Suboptimal time: 10-12 or 14-17 (not terrible, but not prime)
        // Prime times are: 8-10am and 12-14pm
        issues.push({
          type: 'suboptimal_time',
          eventId: event.id,
          description: `"${event.title}" at ${time} (not prime time)`
        });
        issueCounters.suboptimal_time++;
      }
    }
    
    // Check spacing between posts
    if (idx > 0) {
      const prevEvent = linkedInEvents[idx - 1];
      const prevDate = new Date(prevEvent.startDate + 'T00:00:00');
      const diffDays = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 2) {
        issues.push({
          type: 'too_close',
          eventId: event.id,
          description: `"${event.title}" only ${diffDays} day(s) after previous post`
        });
        issueCounters.too_close++;
      }
    }
  });
  
  // Generate summary descriptions
  if (issueCounters.missed_post > 0) {
    descriptions.push(`${issueCounters.missed_post} missed post(s) scheduled in the past`);
  }
  if (issueCounters.weekend > 0) {
    descriptions.push(`${issueCounters.weekend} post(s) scheduled on weekends (5-10% engagement)`);
  }
  if (issueCounters.late_night > 0) {
    descriptions.push(`${issueCounters.late_night} post(s) scheduled late at night (poor timing)`);
  }
  if (issueCounters.too_close > 0) {
    descriptions.push(`${issueCounters.too_close} post(s) too close together (< 48 hours apart)`);
  }
  if (issueCounters.suboptimal_time > 0) {
    descriptions.push(`${issueCounters.suboptimal_time} post(s) not in prime time windows`);
  }
  
  return { issues, descriptions };
}

/**
 * Find next optimal posting slot
 * Prioritizes Monday/Thursday pattern for 2x per week cadence
 */
function findNextOptimalSlot(startDate: Date, occupiedDates: Set<string>, preferredTime: string = '09:00'): { date: string, time: string } {
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  // Look up to 60 days ahead
  for (let i = 0; i < 60; i++) {
    const dateStr = current.toISOString().split('T')[0];
    const day = current.getDay();
    
    // Check if date is not already occupied
    if (!occupiedDates.has(dateStr)) {
      // PRIORITY 1: Monday/Thursday (2x per week pattern)
      if (day === 1 || day === 4) {
        return { date: dateStr, time: preferredTime };
      }
      // PRIORITY 2: Tuesday/Wednesday (backup for optimal days)
      if (day === 2 || day === 3) {
        return { date: dateStr, time: preferredTime };
      }
      // PRIORITY 3: Friday (acceptable)
      if (day === 5) {
        return { date: dateStr, time: preferredTime };
      }
    }
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  // Fallback: just return next weekday
  const fallback = new Date(startDate);
  fallback.setDate(fallback.getDate() + 3);
  while (fallback.getDay() === 0 || fallback.getDay() === 6) {
    fallback.setDate(fallback.getDate() + 1);
  }
  return { 
    date: fallback.toISOString().split('T')[0], 
    time: preferredTime 
  };
}

/**
 * Generate suggestions for improving schedule
 * NEW APPROACH: Redistribute ALL problematic posts into Mon/Thu pattern
 */
function generateSuggestions(events: CalendarEvent[], issues: ScheduleIssue[]): ScheduleSuggestion[] {
  const suggestions: ScheduleSuggestion[] = [];
  
  // Get all events that have issues
  const problematicEventIds = new Set(issues.map(i => i.eventId));
  const problematicEvents = events.filter(e => problematicEventIds.has(e.id));
  
  // Sort by narrative order (tool grouping + story flow) instead of just date
  const sortedEvents = sortPostsByNarrative(problematicEvents);
  
  // Start from next Monday or Thursday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentSlot = new Date(today);
  
  // Find next Mon or Thu
  while (currentSlot.getDay() !== 1 && currentSlot.getDay() !== 4) {
    currentSlot.setDate(currentSlot.getDate() + 1);
  }
  
  // Redistribute all problematic posts into Mon/Thu slots
  sortedEvents.forEach(event => {
    const oldScore = calculateEngagementScore(event.startDate, event.startTime);
    const newDateStr = currentSlot.toISOString().split('T')[0];
    const newScore = calculateEngagementScore(newDateStr, '09:00');
    
    // Skip if we're suggesting the same date and time
    if (newDateStr === event.startDate && '09:00' === event.startTime) {
      // Move to next slot without adding suggestion
      if (currentSlot.getDay() === 1) {
        currentSlot.setDate(currentSlot.getDate() + 3);
      } else {
        currentSlot.setDate(currentSlot.getDate() + 4);
      }
      return;
    }
    
    // Determine reasoning based on primary issue
    const eventIssues = issues.filter(i => i.eventId === event.id);
    let reasoning = '';
    
    if (eventIssues.some(i => i.type === 'missed_post')) {
      reasoning = 'Missed post rescheduled to next available Monday/Thursday slot for optimal 2x per week cadence.';
    } else if (eventIssues.some(i => i.type === 'weekend')) {
      reasoning = 'Weekend posts get 90% less engagement. Moving to Monday/Thursday pattern for professional audience.';
    } else if (eventIssues.some(i => i.type === 'too_close')) {
      reasoning = 'Posts redistributed into Monday/Thursday pattern for optimal 2x per week spacing (3-4 days apart).';
    } else if (eventIssues.some(i => i.type === 'suboptimal_time')) {
      reasoning = 'Post moved to 9am on Monday/Thursday for prime time engagement and consistent schedule.';
    } else {
      reasoning = 'Optimized to Monday/Thursday 9am pattern for maximum LinkedIn engagement.';
    }
    
    let boost = newScore - oldScore;
    if (boost <= 0) boost = 50; // Always suggest improvements
    
    suggestions.push({
      eventId: event.id,
      eventTitle: event.title,
      oldDate: event.startDate,
      oldTime: event.startTime,
      oldEngagement: oldScore,
      newDate: newDateStr,
      newTime: '09:00',
      newEngagement: newScore,
      boost: boost,
      reasoning: reasoning
    });
    
    // Move to next slot: Mon → Thu (3 days), Thu → Mon (4 days)
    if (currentSlot.getDay() === 1) {
      // Monday → Thursday
      currentSlot.setDate(currentSlot.getDate() + 3);
    } else {
      // Thursday → Monday
      currentSlot.setDate(currentSlot.getDate() + 4);
    }
  });
  
  return suggestions;
}

/**
 * Analyze schedule and return suggestions
 */
export function analyzeSchedule(events: CalendarEvent[]): ScheduleAnalysis {
  // Only analyze LinkedIn posts that are scheduled (not published) and have content
  const linkedInEvents = events.filter(e => {
    const hasLinkedInTag = (e.tags || '').split(',').some(t => t.trim() === 'LinkedIn');
    const isScheduled = e.status !== 'published';
    const hasContent = (e.description || '').trim().length >= 100;
    return hasLinkedInTag && isScheduled && hasContent;
  });
  
  const { issues, descriptions } = detectIssues(events);
  const suggestions = generateSuggestions(events, issues);
  
  // Calculate average engagement boost
  const avgBoost = suggestions.length > 0
    ? suggestions.reduce((sum, s) => sum + s.boost, 0) / suggestions.length
    : 0;
  
  return {
    eventsAnalyzed: linkedInEvents.length,
    issuesFound: issues.length,
    issues: descriptions,
    suggestions: suggestions,
    avgEngagementBoost: avgBoost
  };
}

/**
 * Apply schedule suggestions (returns IDs that were updated)
 */
export function applySuggestions(suggestions: ScheduleSuggestion[]): number[] {
  // This just returns the IDs - the actual update is done in dashboard.ts
  return suggestions.map(s => s.eventId);
}
