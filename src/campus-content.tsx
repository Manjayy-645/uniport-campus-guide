import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  announcements, events, places, services,
  type Announcement, type CampusEvent, type Place, type Service,
} from './content';

type CampusContent = {
  places: readonly Place[];
  events: readonly CampusEvent[];
  services: readonly Service[];
  announcements: readonly Announcement[];
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const configured = Boolean(url || key);
function createCampusClient(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

let client: ReturnType<typeof createCampusClient> | undefined;

const sample: CampusContent = { places, events, services, announcements };
const empty: CampusContent = { places: [], events: [], services: [], announcements: [] };

async function loadContent(signal: AbortSignal): Promise<CampusContent> {
  if (!url || !key) throw new Error('Supabase URL and publishable key are required.');
  client ??= createCampusClient(url, key);
  const [placeRows, eventRows, serviceRows, noticeRows] = await Promise.all([
    client.from('places').select('id,name,aliases,category,campus_area,landmark,directions,map_url,latitude,longitude')
      .eq('status', 'published').order('name').abortSignal(signal),
    client.from('events').select('id,title,description,organiser,starts_at,ends_at,cost,place_id,external_venue')
      .eq('status', 'published').order('starts_at').abortSignal(signal),
    client.from('services').select('id,name,category,description,official_url,contact,place_id')
      .eq('status', 'published').order('name').abortSignal(signal),
    client.from('announcements').select('id,title,summary,source_url')
      .eq('status', 'published').order('published_at', { ascending: false }).abortSignal(signal),
  ]);

  if (placeRows.error) throw placeRows.error;
  if (eventRows.error) throw eventRows.error;
  if (serviceRows.error) throw serviceRows.error;
  if (noticeRows.error) throw noticeRows.error;

  return {
    places: placeRows.data.map(row => ({
      id: row.id, name: row.name, aliases: row.aliases, category: row.category,
      campusArea: row.campus_area, landmark: row.landmark, directions: row.directions,
      mapUrl: row.map_url ?? undefined,
      mapQuery: row.latitude === null ? undefined : `${row.latitude},${row.longitude}`,
    })),
    events: eventRows.data.map(row => ({
      id: row.id, name: row.title, description: row.description, organiser: row.organiser,
      startsAt: row.starts_at, endsAt: row.ends_at ?? undefined, cost: row.cost,
      placeId: row.place_id ?? undefined, externalVenue: row.external_venue ?? undefined,
    })),
    services: serviceRows.data.map(row => ({
      id: row.id, name: row.name, description: row.description, category: row.category,
      officialUrl: row.official_url ?? undefined, contact: row.contact ?? undefined,
      placeId: row.place_id ?? undefined,
    })),
    announcements: noticeRows.data.map(row => ({
      id: row.id, title: row.title, summary: row.summary, sourceUrl: row.source_url ?? undefined,
    })),
  };
}

const CampusContentContext = createContext({
  content: sample,
  status: 'sample' as 'sample' | 'loading' | 'ready' | 'error',
  retry: () => {},
});

export function CampusContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(configured ? empty : sample);
  const [status, setStatus] = useState<'sample' | 'loading' | 'ready' | 'error'>(configured ? 'loading' : 'sample');
  const [request, setRequest] = useState(0);
  const retry = useCallback(() => {
    setStatus('loading');
    setRequest(value => value + 1);
  }, []);

  useEffect(() => {
    if (!configured) return;
    const controller = new AbortController();
    void loadContent(controller.signal).then(snapshot => {
      if (controller.signal.aborted) return;
      setContent(snapshot);
      setStatus('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });
    return () => controller.abort();
  }, [request]);

  return <CampusContentContext.Provider value={{ content, status, retry }}>{children}</CampusContentContext.Provider>;
}

export function useCampusContent() {
  return useContext(CampusContentContext);
}
