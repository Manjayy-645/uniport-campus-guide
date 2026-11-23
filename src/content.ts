export type Place = {
  id: string;
  name: string;
  aliases: readonly string[];
  category: string;
  campusArea: string;
  landmark: string;
  directions: string;
  mapQuery?: string;
  mapUrl?: string;
};

export type CampusEvent = {
  id: string;
  name: string;
  startsAt: string;
  endsAt?: string;
  cost: string;
  organiser: string;
  description: string;
  placeId?: string;
  externalVenue?: string;
};

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string;
};

export const places: readonly Place[] = [
  { id: 'library', name: 'University Library', aliases: ['library', 'reading room'], category: 'Study', campusArea: 'Campus area to be verified',
    landmark: 'Landmark to be verified', directions: 'Campus walking directions will be added after a site visit.',
    mapQuery: 'University of Port Harcourt Library' },
  { id: 'student-affairs', name: 'Student Affairs', aliases: ['student welfare', 'student office'], category: 'Office', campusArea: 'Campus area to be verified',
    landmark: 'Landmark to be verified', directions: 'Campus walking directions will be added after a site visit.',
    mapQuery: 'University of Port Harcourt Student Affairs' },
] as const;

export const events: readonly CampusEvent[] = [
  { id: 'tech-meetup', name: 'Tech Meetup', startsAt: '2026-12-04T14:00:00+01:00', cost: 'Free', organiser: 'Sample student tech club',
    description: 'A student meetup concept for sharing projects and meeting other builders.', placeId: 'library' },
] as const;

export const announcements: readonly Announcement[] = [
  { id: 'pilot-listings', title: 'Campus Guide preview',
    summary: 'The listings in this preview are samples. Confirm locations before travelling.' },
] as const;

const campusDateTime = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'Africa/Lagos',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatEventTime(startsAt: string) {
  return campusDateTime.format(new Date(startsAt)) + ' WAT';
}

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  placeId?: string;
  officialUrl?: string;
  contact?: string;
};

export const services: readonly Service[] = [
  { id: 'student-affairs', name: 'Student Affairs', category: 'Student support',
    description: 'Student welfare and general enquiries', placeId: 'student-affairs' },
  { id: 'library', name: 'Library', category: 'Academic support',
    description: 'Study spaces and library support', placeId: 'library' },
];

export function matches(query: string, fields: readonly string[]) {
  const searchable = fields.join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(term => searchable.includes(term));
}

export function directionsUrl(query: string) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query);
}
