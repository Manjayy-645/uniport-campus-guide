import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Image, Linking, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { directionsUrl, formatEventTime, matches } from './content';
import { useCampusContent } from './campus-content';

const tabs = ['Home', 'Explore', 'What’s On', 'Services'] as const;
type Tab = typeof tabs[number];
type Detail = { kind: 'place' | 'event' | 'service'; id: string };

async function openLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Couldn’t open the link', 'Check your connection and try again.');
  }
}

function Row({ title, subtitle, onPress, primary = false }: {
  title: string; subtitle: string; onPress: () => void; primary?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, primary && styles.primaryRow, pressed && styles.pressed]}>
      <View style={styles.rowText}>
        <Text style={[styles.label, primary && styles.primaryTitle]}>{title}</Text>
        <Text style={[styles.body, primary && styles.primarySubtitle]}>{subtitle}</Text>
      </View>
      <Text accessible={false} style={[styles.chevron, primary && styles.primaryTitle]}>›</Text>
    </Pressable>
  );
}

export function Guide({ tab = 'Home', detail }: { tab?: Tab; detail?: Detail }) {
  const router = useRouter();
  const home = !detail && tab === 'Home';
  const { content: { places, events, services, announcements }, status, retry } = useCampusContent();
  const showCampusPhoto = status === 'sample' && tab === 'Home' && !detail;
  const showMeetupPhoto = status === 'sample' && detail?.kind === 'event' && detail.id === 'tech-meetup';
  const available = status === 'ready' || status === 'sample';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const place = detail?.kind === 'place' ? places.find(item => item.id === detail.id) : undefined;
  const event = detail?.kind === 'event' ? events.find(item => item.id === detail.id) : undefined;
  const service = detail?.kind === 'service' ? services.find(item => item.id === detail.id) : undefined;
  const venue = event && places.find(item => item.id === event.placeId);
  const office = service && places.find(item => item.id === service.placeId);
  const officialUrl = service?.officialUrl;
  const mapUrl = place?.mapUrl ?? (place?.mapQuery && directionsUrl(place.mapQuery));
  const upcomingEvents = events.filter(item => Date.parse(item.endsAt ?? item.startsAt) >= Date.now());

  function open(kind: Detail['kind'], id: string) {
    const pathname = kind === 'place' ? '/place/[id]' : kind === 'event' ? '/event/[id]' : '/service/[id]';
    router.push({ pathname, params: { id } });
  }

  const visiblePlaces = places.filter(item => (tab !== 'Explore' || category === 'All' || item.category === category) && matches(query, [item.name, item.category, ...item.aliases]));
  const visibleServices = services.filter(item => matches(query, [item.name, item.description, item.category]));
  const searching = query.trim().length > 0;
  const showPlaces = available && !detail && (tab === 'Explore' || (tab === 'Home' && searching));
  const showServices = available && !detail && (tab === 'Services' || (tab === 'Home' && searching));
  const showEvents = available && !detail && (tab === 'What’s On' || (tab === 'Home' && !searching));

  return (
    <SafeAreaView style={styles.screen} edges={detail ? ['left', 'right', 'bottom'] : ['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView key={detail ? detail.kind + detail.id : tab} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, home && styles.homeHeader]}>
          {home && <Text style={styles.eyebrow}>UNIPORT</Text>}
          <Text accessibilityRole="header" style={[styles.heading, home && styles.homeTitle]}>{place?.name ?? event?.name ?? service?.name ?? (detail ? (available ? 'Listing unavailable' : 'Campus Guide') : tab === 'Home' ? 'Campus Guide' : tab)}</Text>
          {available && !detail && tab !== 'What’s On' && (
            <TextInput style={styles.input} value={query} onChangeText={setQuery} autoCorrect={false}
              accessibilityLabel="Search campus guide" placeholder={tab === 'Explore' ? 'Search places' : tab === 'Services' ? 'Search services' : 'Find a place or service'}
              placeholderTextColor="#536987" />
          )}
        </View>
        {status === 'sample' && !detail && <Text style={styles.previewLabel}>Preview · sample campus listings</Text>}
        {status === 'loading' && <Text accessibilityLiveRegion="polite" style={styles.body}>Loading campus listings…</Text>}
        {status === 'error' && <Row title="Try again" subtitle="Campus listings couldn’t load." onPress={retry} />}

        {available && !detail && tab === 'Explore' && <View style={styles.filters}>
          {['All', ...new Set(places.map(item => item.category))].map(item => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }}
              onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.selected]}>
              <Text style={[styles.label, category === item && styles.selectedText]}>{item}</Text>
            </Pressable>
          ))}
        </View>}
        {showPlaces && visiblePlaces.map(item => (
          <Row key={item.id} title={item.name} subtitle={item.category} onPress={() => open('place', item.id)} />
        ))}
        {showServices && visibleServices.map(item => (
          <Row key={item.id} title={item.name} subtitle={item.description} onPress={() => open('service', item.id)} />
        ))}
        {showPlaces && !searching && visiblePlaces.length === 0 && <Text style={styles.body}>No places in this category.</Text>}
        {showServices && !searching && visibleServices.length === 0 && <Text style={styles.body}>No services listed.</Text>}
        {available && searching && !detail && ((!showPlaces || !visiblePlaces.length) && (!showServices || !visibleServices.length)) &&
          <Text style={styles.body}>No matches. Try another name.</Text>}

        {showCampusPhoto && !searching && (
          <Image source={require('../assets/preview/campus.jpg')} style={styles.photo}
            accessible accessibilityLabel="Illustrative photo of students walking on campus" />
        )}

        {showEvents && <>
          {tab === 'Home' && <Text style={styles.section}>Campus events</Text>}
          {upcomingEvents.map(item => (
            <Row key={item.id} title={item.name} subtitle={formatEventTime(item.startsAt)} onPress={() => open('event', item.id)} />
          ))}
          {upcomingEvents.length === 0 && <Text style={styles.body}>No upcoming events.</Text>}
          {tab === 'Home' && <Row primary title="Student services" subtitle="Find campus offices" onPress={() => router.navigate('/services')} />}
        </>}

        {showEvents && tab === 'Home' && <>
          <Text style={styles.section}>Campus notices</Text>
          {announcements.length === 0 && <Text style={styles.body}>No campus notices.</Text>}
          {announcements.map(item => item.sourceUrl ? (
            <Row key={item.id} title={item.title} subtitle={item.summary}
              onPress={() => { if (item.sourceUrl) void openLink(item.sourceUrl); }} />
          ) : (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{item.title}</Text>
                <Text style={styles.body}>{item.summary}</Text>
              </View>
            </View>
          ))}
        </>}

        {event && <>
          {showMeetupPhoto && (
            <Image source={require('../assets/preview/meetup.jpg')} style={styles.photo}
              accessible accessibilityLabel="Illustrative photo of a student tech meetup" />
          )}
          <Text style={styles.badge}>{event.cost} · {formatEventTime(event.startsAt)}</Text>
          <Text style={styles.body}>{event.description}</Text>
          <Text style={styles.body}>Organiser · {event.organiser}</Text>
          {!venue && event.externalVenue && <Text style={styles.body}>Venue · {event.externalVenue}</Text>}
          {venue && <Row primary title="View venue" subtitle={venue.name} onPress={() => open('place', venue.id)} />}
          <Row title="Share event" subtitle="Open the phone’s share options" onPress={() => {
            void Share.share({ message: event.name + ' · ' + formatEventTime(event.startsAt) + ' · UNIPORT Campus Guide' })
              .catch(() => Alert.alert('Couldn’t share the event', 'Try again.'));
          }} />
        </>}

        {service && <>
          <Text style={styles.badge}>{service.category}</Text>
          <Text style={styles.body}>{service.description}</Text>
          {service.contact && <Text style={styles.body}>{service.contact}</Text>}
          {officialUrl && <Row title="Open official website" subtitle="Opens in your browser"
            onPress={() => void openLink(officialUrl)} />}
          {office && <Row primary title="View office" subtitle={office.name} onPress={() => open('place', office.id)} />}
        </>}

        {place && <>
          <Text style={styles.badge}>{place.category} · {place.campusArea}</Text>
          <Text style={styles.section}>Nearest landmark</Text>
          <Text style={styles.body}>{place.landmark}</Text>
          <Text style={styles.section}>Directions</Text>
          <Text style={styles.body}>{place.directions}</Text>
          {mapUrl && <Row primary title="Open in Maps" subtitle="Opens in your browser" onPress={() => void openLink(mapUrl)} />}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F8FD' },
  content: { padding: 20, gap: 14, paddingBottom: 36 },
  header: { gap: 12, marginBottom: 2 },
  homeHeader: { backgroundColor: '#123365', padding: 20, borderRadius: 22, gap: 10 },
  homeTitle: { color: '#FFFFFF' },
  previewLabel: { color: '#435D7A', fontSize: 13, fontWeight: '600' },
  photo: { width: '100%', aspectRatio: 1.85, borderRadius: 15, backgroundColor: '#D8EEFC' },
  eyebrow: { color: '#F7DB82', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#123365', fontSize: 34, fontWeight: '800' },
  section: { color: '#123365', fontSize: 21, fontWeight: '700', marginTop: 8 },
  body: { color: '#354E70', fontSize: 16, lineHeight: 23 },
  label: { color: '#123365', fontSize: 17, fontWeight: '700' },
  rowText: { flex: 1, gap: 4 },
  chevron: { color: '#435D7A', fontSize: 26, lineHeight: 28 },
  primaryRow: { backgroundColor: '#123365', borderColor: '#123365' },
  primaryTitle: { color: '#FFFFFF' },
  primarySubtitle: { color: '#D8EEFC', fontSize: 14 },
  pressed: { opacity: 0.82 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF',
    borderColor: '#D9E5F2', borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 64 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#B8CDE3', borderWidth: 1, borderRadius: 12,
    padding: 14, color: '#123365', fontSize: 16 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#F7DB82', color: '#342900', padding: 9,
    borderRadius: 8, fontWeight: '700' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { backgroundColor: '#D8EEFC', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  selected: { backgroundColor: '#123365' },
  selectedText: { color: '#FFFFFF' },
});
