export const collections = {
  places: { label: 'Places', singular: 'place', title: 'name', fields: [
    ['name', 'Place name', 'text', true], ['aliases', 'Nicknames (comma separated)', 'text'],
    ['category', 'Category', 'text', true], ['campus_area', 'Campus area', 'text', true],
    ['landmark', 'Nearest landmark', 'text', true], ['directions', 'Walking directions', 'textarea', true],
    ['map_url', 'Map link', 'url'], ['latitude', 'Latitude', 'number'], ['longitude', 'Longitude', 'number'],
  ] },
  events: { label: 'Events', singular: 'event', title: 'title', fields: [
    ['title', 'Event title', 'text', true], ['description', 'Description', 'textarea', true],
    ['organiser', 'Organiser', 'text', true], ['cost', 'Cost', 'text', true],
    ['starts_at', 'Starts (WAT)', 'datetime-local', true], ['ends_at', 'Ends (WAT)', 'datetime-local'],
    ['place_id', 'Campus venue', 'place'], ['external_venue', 'External venue', 'text'],
  ] },
  services: { label: 'Services', singular: 'service', title: 'name', fields: [
    ['name', 'Service name', 'text', true], ['category', 'Category', 'text', true],
    ['description', 'Description', 'textarea', true], ['official_url', 'Official website', 'url'],
    ['contact', 'Public contact details', 'text'], ['place_id', 'Campus office', 'place'],
  ] },
  announcements: { label: 'Announcements', singular: 'announcement', title: 'title', fields: [
    ['title', 'Announcement title', 'text', true], ['summary', 'Summary', 'textarea', true],
    ['source_url', 'Source link', 'url'], ['published_at', 'Publish from (WAT)', 'datetime-local'],
    ['expires_at', 'Expiry (WAT)', 'datetime-local'],
  ] },
};

export function fieldValue(type, value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (type === 'datetime-local') {
    return new Date(Date.parse(value) + 3600000).toISOString().slice(0, 16);
  }
  return String(value);
}

export function readFields(collection, data, status, now = new Date()) {
  const record = { status };
  for (const [key, label, type, required] of collections[collection].fields) {
    const value = String(data.get(key) ?? '').trim();
    if (required && !value) throw new Error(label + ' is required.');
    if (type === 'url' && value && !/^https:\/\/[^\s]+$/.test(value)) throw new Error(label + ' must use HTTPS.');
    if (key === 'aliases') record[key] = [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))];
    else if (type === 'number') record[key] = value ? Number(value) : null;
    else if (type === 'datetime-local' && value) {
      const parsed = Date.parse(value + '+01:00');
      if (!Number.isFinite(parsed)) throw new Error(label + ' is invalid.');
      record[key] = new Date(parsed).toISOString();
    } else record[key] = value || null;
  }
  if (collection === 'places') {
    const { latitude, longitude } = record;
    if ((latitude === null) !== (longitude === null)) throw new Error('Enter both coordinates or leave both blank.');
    if (latitude !== null && (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) || Math.abs(longitude) > 180)) throw new Error('Enter valid latitude and longitude.');
  }
  if (record.ends_at && record.ends_at < record.starts_at) throw new Error('The event must end after it starts.');
  if (collection === 'announcements' && status === 'published') record.published_at ??= now.toISOString();
  if (record.published_at && record.expires_at && record.expires_at <= record.published_at) {
    throw new Error('Expiry must come after publication.');
  }
  return record;
}

export function displayStatus(collection, row, now = Date.now()) {
  if (collection !== 'announcements' || row.status !== 'published') return row.status;
  if (Date.parse(row.published_at) > now) return 'scheduled';
  if (Date.parse(row.expires_at) <= now) return 'expired';
  return row.status;
}
