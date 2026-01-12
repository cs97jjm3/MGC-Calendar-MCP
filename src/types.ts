export interface CalendarEvent {
  id: number;
  uid: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  content: string;
  tags: string;
  status: 'scheduled' | 'published';
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  allDay?: boolean;
  content?: string;
  tags?: string;
  status?: 'scheduled' | 'published';
  publishedDate?: string | null;
}

export interface UpdateEventInput {
  id: number;
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  allDay?: boolean;
  content?: string;
  tags?: string;
  status?: 'scheduled' | 'published';
  publishedDate?: string | null;
}
