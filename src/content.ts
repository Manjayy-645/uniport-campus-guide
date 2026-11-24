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
  sourceUrl?: string;
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
  timeUnannounced?: boolean;
  sourceUrl?: string;
};

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string;
};

const university = 'https://www.uniport.edu.ng';
const librarySite = 'https://www.library.uniport.edu.ng';
const servicesSite = 'https://services.uniport.edu.ng';
const studentPortal = 'https://ups.uniport.edu.ng';
const policies = university + '/wp-content/uploads/2025/01';
const libraryAbout = librarySite + '/about-us/';
const adminHandbook = policies + '/Handbook_of_Administrative_Procedures_for_Uniport.pdf';
const healthLocation = policies + '/General_Regulations_for_Graduate_Programmes.pdf';
const healthAndWellness = university + '/health-wellness/';
const welcomeNotice = university + '/latest-info/a-welcome-message-from-the-vice-chancellor-prof-chike-princewill-r-chike-to-our-new-and-returning-students-for-2026-2027-academic-session/';
const feesNotice = university + '/latest-info/university-portal-for-payment-of-fees/';
const academicCalendar = university + '/academic-calender/';

export const universityNewsUrl = university + '/latest-news/';

export const places: readonly Place[] = [
  {
    id: 'library',
    name: 'Donald E. U. Ekong Library',
    aliases: ['university library', 'main library', 'reading room', 'ekong'],
    category: 'Study',
    campusArea: 'University Park (Abuja Campus)',
    landmark: 'The library building houses American Corner Port Harcourt.',
    directions: 'Ask for the main Donald Ekong Library when you reach University Park. The circulation and reading areas are on the ground floor.',
    mapQuery: 'Donald Ekong Library University of Port Harcourt',
    sourceUrl: libraryAbout,
  },
  {
    id: 'american-corner',
    name: 'American Corner Port Harcourt',
    aliases: ['educationusa', 'education usa', 'american spaces'],
    category: 'Study',
    campusArea: 'University Park (Abuja Campus)',
    landmark: 'Inside the Donald E. U. Ekong Library.',
    directions: 'Go to the ground floor of the main library and ask at circulation for American Corner Port Harcourt.',
    mapQuery: 'Donald Ekong Library University of Port Harcourt',
    sourceUrl: libraryAbout,
  },
  {
    id: 'convocation-arena',
    name: 'New Convocation Arena',
    aliases: ['convocation ground', 'orientation venue', 'convocation centre'],
    category: 'Event venue',
    campusArea: 'University Park (Abuja Campus)',
    landmark: 'Look for the New Convocation Arena in University Park.',
    directions: 'Ask for the New Convocation Arena at Abuja Campus. Check the event notice for the entrance and arrival instructions.',
    mapQuery: 'New Convocation Arena University of Port Harcourt Abuja Campus',
    sourceUrl: university + '/latest-info/2025-2026-orientation-programme/',
  },
  {
    id: 'cbn-auditorium',
    name: 'CBN Centre of Excellence Auditorium',
    aliases: ['cbn building', 'cbn auditorium', 'inaugural lecture hall', 'cbn center'],
    category: 'Event venue',
    campusArea: 'University Park (Abuja Campus)',
    landmark: 'Inside the CBN Centre of Excellence building.',
    directions: 'Ask for the CBN Centre of Excellence at University Park. On arrival, confirm the auditorium entrance with the event staff.',
    mapQuery: 'CBN Centre of Excellence University of Port Harcourt',
    sourceUrl: university + '/latest-info/216th-inaugural-lecture/',
  },
  {
    id: 'medical-centre',
    name: 'University Medical Centre',
    aliases: ['clinic', 'health centre', 'health center', 'student clinic', 'medical center'],
    category: 'Health',
    campusArea: 'Choba Park',
    landmark: 'Look for the university’s Medical Centre at Choba Park.',
    directions: 'Ask for the campus Medical Centre at Choba Park. Confirm where student consultations are handled when you arrive.',
    sourceUrl: healthLocation,
  },
  {
    id: 'niger-delta-studies',
    name: 'Institute of Niger Delta Studies',
    aliases: ['inds', 'niger delta institute'],
    category: 'Academic',
    campusArea: 'Delta Park Campus',
    landmark: 'Institute of Niger Delta Studies, Delta Park.',
    directions: 'Go to Delta Park in Choba and ask for the Institute of Niger Delta Studies. Check the institute portal for programme and office enquiries.',
    sourceUrl: 'https://inds.uniport.edu.ng/',
  },
];

export const events: readonly CampusEvent[] = [
  {
    id: 'cpg-orientation-2026',
    name: 'Centre for Petroleum Geosciences orientation',
    startsAt: '2026-12-02T00:00:00+01:00',
    endsAt: '2026-12-03T00:00:00+01:00',
    timeUnannounced: true,
    cost: 'Fee not stated',
    organiser: 'Centre for Petroleum Geosciences',
    description: 'Orientation for admitted students in the centre’s 2026/2027 graduate programmes. Confirm the time and venue with the centre at cpg@uniport.edu.ng.',
    sourceUrl: university + '/latest-info/admission-into-graduate-programmes-inpetroleum-green-energy-geosciences-and-asset-management-for-2026-2027-session/',
  },
];

export const announcements: readonly Announcement[] = [
  {
    id: 'session-welcome-2026',
    title: 'Starting the 2026/2027 session',
    summary: 'Read the university’s welcome message for new and returning students and its introduction to the Unified Portal System.',
    sourceUrl: welcomeNotice,
  },
  {
    id: 'fees-and-level',
    title: 'Check your level and fee status',
    summary: 'The university directs students to the Unified Portal System to confirm their academic level and school fees payment status.',
    sourceUrl: feesNotice,
  },
  {
    id: 'academic-calendar',
    title: 'Check the academic calendar',
    summary: 'Look for the approved schedule for your session and programme before planning around registration, teaching, or examinations.',
    sourceUrl: academicCalendar,
  },
];

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

const campusDate = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'Africa/Lagos',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function eventSchedule(event: CampusEvent) {
  if (event.timeUnannounced) return campusDate.format(new Date(event.startsAt)) + ' · Time to be confirmed';
  return formatEventTime(event.startsAt);
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
  {
    id: 'student-portal',
    name: 'Student Portal (UPS)',
    category: 'Registration and fees',
    description: 'Use the Unified Portal System to manage course registration, check your academic level, and review your fee payment status.',
    officialUrl: studentPortal,
  },
  {
    id: 'new-student-clearance',
    name: 'New student registration and clearance',
    category: 'Admissions',
    description: 'Start online registration and clearance after admission. The portal lists sign-in instructions for newly admitted students.',
    officialUrl: studentPortal + '/auth/starthere',
  },
  {
    id: 'student-affairs',
    name: 'Student Affairs',
    category: 'Student support',
    description: 'The Student Affairs Division handles student welfare and accommodation. Check the university handbook for the division’s responsibilities.',
    officialUrl: adminHandbook,
  },
  {
    id: 'accommodation',
    name: 'Hostel accommodation',
    category: 'Student support',
    description: 'Read the university’s accommodation payment instructions and confirm your allocation and the current process before paying.',
    officialUrl: university + '/latest-info/payment-of-accommodation-fees/',
  },
  {
    id: 'library',
    name: 'Library services',
    category: 'Academic support',
    description: 'Find the library catalogue, electronic resources, research support, and published opening hours on the Donald Ekong Library website.',
    placeId: 'library',
    officialUrl: librarySite + '/',
  },
  {
    id: 'american-corner',
    name: 'American Corner and EducationUSA',
    category: 'Academic support',
    description: 'American Corner Port Harcourt is based in the main library. Check library updates for EducationUSA sessions and other programmes.',
    placeId: 'american-corner',
    officialUrl: libraryAbout,
  },
  {
    id: 'health',
    name: 'Campus health and wellness',
    category: 'Health',
    description: 'Students can access campus health services at the University Medical Centre in Choba Park. The university also publishes health and wellness resources.',
    placeId: 'medical-centre',
    officialUrl: healthAndWellness,
  },
  {
    id: 'transcripts',
    name: 'Academic transcripts',
    category: 'Records and certificates',
    description: 'Use the university’s eTranscript service to request an academic transcript or track a request you have already made.',
    officialUrl: servicesSite + '/etranscripts',
  },
  {
    id: 'records',
    name: 'Records and verification',
    category: 'Records and certificates',
    description: 'Find the university’s records verification services and instructions related to certificate collection.',
    officialUrl: servicesSite + '/erecords/e-records-request',
  },
  {
    id: 'eclearance',
    name: 'eClearance',
    category: 'Records and certificates',
    description: 'Open eClearance through UNIPORT Online Services. Newly admitted students should use the new-student registration route for admission clearance.',
    officialUrl: servicesSite + '/clearance',
  },
  {
    id: 'academic-calendar',
    name: 'Academic calendar',
    category: 'Academic support',
    description: 'Find published academic calendars by session and programme. Check the revision before relying on a date.',
    officialUrl: academicCalendar,
  },
  {
    id: 'open-learning',
    name: 'Open Educational Resources',
    category: 'Academic support',
    description: 'Explore teaching and learning materials through the university’s Open Educational Resources portal.',
    officialUrl: 'https://oer.uniport.edu.ng/',
  },
];

export function matches(query: string, fields: readonly string[]) {
  const searchable = fields.join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(term => searchable.includes(term));
}

export function directionsUrl(query: string) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query);
}
