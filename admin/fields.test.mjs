import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { displayStatus, fieldValue, readFields } from './fields.mjs';

test('event timestamps round-trip through the WAT form and validate ordering', () => {
  const fields = new Map(Object.entries({
    title: 'Campus meetup', description: 'Bring a notebook', organiser: 'Student group', cost: 'Free',
    starts_at: '2026-12-04T14:00', ends_at: '2026-12-04T15:30', place_id: 'library',
  }));
  const event = readFields('events', fields, 'published');
  assert.equal(event.starts_at, '2026-12-04T13:00:00.000Z');
  assert.equal(fieldValue('datetime-local', event.starts_at), '2026-12-04T14:00');
  assert.equal(event.place_id, 'library');
  fields.set('ends_at', '2026-12-04T13:30');
  assert.throws(() => readFields('events', fields, 'draft'), /end after/);
});

test('announcements get a publication time and show scheduled or expired states', () => {
  const fields = new Map([['title', 'Campus notice'], ['summary', 'Check the portal']]);
  const clock = new Date('2026-12-04T13:00:00Z');
  assert.equal(readFields('announcements', fields, 'draft', clock).published_at, null);
  assert.equal(readFields('announcements', fields, 'published', clock).published_at, clock.toISOString());
  fields.set('published_at', '2026-12-04T15:00');
  fields.set('expires_at', '2026-12-04T16:00');
  const scheduled = readFields('announcements', fields, 'published', clock);
  assert.equal(displayStatus('announcements', scheduled, +clock), 'scheduled');
  assert.equal(displayStatus('announcements', scheduled, Date.parse('2026-12-04T15:00:00Z')), 'expired');
});

test('place drafts validate coordinate pairs and normalize aliases', () => {
  const fields = new Map(Object.entries({
    name: 'Library', aliases: 'reading room, library, reading room', category: 'Study',
    campus_area: 'University Park', landmark: 'Main road', directions: 'Follow the signs',
    latitude: '4.9',
  }));
  assert.throws(() => readFields('places', fields, 'draft'), /both coordinates/);
  fields.set('longitude', '6.9');
  assert.deepEqual(readFields('places', fields, 'draft').aliases, ['reading room', 'library']);
  fields.set('map_url', 'http://example.com');
  assert.throws(() => readFields('places', fields, 'draft'), /HTTPS/);
});
