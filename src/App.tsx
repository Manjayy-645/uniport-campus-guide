import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { announcements, directionsUrl, events, formatEventTime, matches, places, services } from './content';

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

function Row({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.body}>{subtitle}</Text>
      </View>
      <Text style={styles.label}>›</Text>
    </Pressable>
  );
}

export function Guide({ tab = 'Home', detail }: { tab?: Tab; detail?: Detail }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const place = detail?.kind === 'place' ? places.find(item => item.id === detail.id) : undefined;
  const event = detail?.kind === 'event' ? events.find(item => item.id === detail.id) : undefined;
  const service = detail?.kind === 'service' ? services.find(item => item.id === detail.id) : undefined;
  const venue = event && places.find(item => item.id === event.placeId);
  const office = service && places.find(item => item.id === service.placeId);
  const officialUrl = service?.officialUrl;
  const upcomingEvents = events.filter(item => Date.parse(item.startsAt) >= Date.now());

  function open(kind: Detail['kind'], id: string) {
    const pathname = kind === 'place' ? '/place/[id]' : kind === 'event' ? '/event/[id]' : '/service/[id]';
    router.push({ pathname, params: { id } });
  }

  const visiblePlaces = places.filter(item => (tab !== 'Explore' || category === 'All' || item.category === category) && matches(query, [item.name, item.category, ...item.aliases]));
  const visibleServices = services.filter(item => matches(query, [item.name, item.description, item.category]));
  const searching = query.trim().length > 0;
  const showPlaces = !detail && (tab === 'Explore' || (tab === 'Home' && searching));
  const showServices = !detail && (tab === 'Services' || (tab === 'Home' && searching));
  const showEvents = !detail && (tab === 'What’s On' || (tab === 'Home' && !searching));

  return (
    <SafeAreaView style={styles.screen} edges={detail ? ['left', 'right', 'bottom'] : ['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView key={detail ? detail.kind + detail.id : tab} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!detail && tab === 'Home' && <Text style={styles.eyebrow}>UNIPORT</Text>}
        <Text accessibilityRole="header" style={styles.heading}>{place?.name ?? event?.name ?? service?.name ?? (detail ? 'Listing unavailable' : tab === 'Home' ? 'Campus Guide' : tab)}</Text>
        {!detail && <Text style={styles.body}>Prototype · sample campus listings</Text>}

        {!detail && tab !== 'What’s On' && (
          <TextInput style={styles.input} value={query} onChangeText={setQuery} autoCorrect={false}
            accessibilityLabel="Search campus guide" placeholder={tab === 'Explore' ? 'Search places' : tab === 'Services' ? 'Search services' : 'Find a place or service'}
            placeholderTextColor="#536987" />
        )}

        {!detail && tab === 'Explore' && <View style={styles.filters}>
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
        {searching && !detail && ((!showPlaces || !visiblePlaces.length) && (!showServices || !visibleServices.length)) &&
          <Text style={styles.body}>No matches. Try another name.</Text>}

        {showEvents && <>
          {tab === 'Home' && <Text style={styles.section}>Campus events</Text>}
          {upcomingEvents.map(item => (
            <Row key={item.id} title={item.name} subtitle={formatEventTime(item.startsAt)} onPress={() => open('event', item.id)} />
          ))}
          {upcomingEvents.length === 0 && <Text style={styles.body}>No upcoming events.</Text>}
          {tab === 'Home' && <Row title="Student services" subtitle="Find campus offices" onPress={() => router.navigate('/services')} />}
        </>}

        {showEvents && tab === 'Home' && <>
          <Text style={styles.section}>Campus notices</Text>
          {announcements.map(item => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{item.title}</Text>
                <Text style={styles.body}>{item.summary}</Text>
              </View>
            </View>
          ))}
        </>}

        {event && <>
          <Text style={styles.badge}>{event.cost} · {formatEventTime(event.startsAt)}</Text>
          <Text style={styles.body}>{event.description}</Text>
          <Text style={styles.body}>Organiser · {event.organiser}</Text>
          {venue && <Row title="View venue" subtitle={venue.name} onPress={() => open('place', venue.id)} />}
          <Row title="Share event" subtitle="Open the phone’s share options" onPress={() => {
            void Share.share({ message: event.name + ' · ' + formatEventTime(event.startsAt) + ' · Campus Guide prototype' })
              .catch(() => Alert.alert('Couldn’t share the event', 'Try again.'));
          }} />
        </>}

        {service && <>
          <Text style={styles.badge}>{service.category}</Text>
          <Text style={styles.body}>{service.description}</Text>
          {officialUrl && <Row title="Open official website" subtitle="Opens in your browser"
            onPress={() => void openLink(officialUrl)} />}
          {office && <Row title="View office" subtitle={office.name} onPress={() => open('place', office.id)} />}
        </>}

        {place && <>
          <Text style={styles.badge}>{place.category} · {place.campusArea}</Text>
          <Text style={styles.section}>Nearest landmark</Text>
          <Text style={styles.body}>{place.landmark}</Text>
          <Text style={styles.section}>Directions</Text>
          <Text style={styles.body}>{place.directions}</Text>
          <Row title="Open in Maps" subtitle="Search for this place in Google Maps" onPress={() => void openLink(directionsUrl(place.mapQuery))} />
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F8FD' },
  content: { padding: 22, gap: 14, paddingBottom: 32 },
  eyebrow: { color: '#123365', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#123365', fontSize: 38, fontWeight: '800' },
  section: { color: '#123365', fontSize: 21, fontWeight: '700', marginTop: 8 },
  body: { color: '#354E70', fontSize: 16, lineHeight: 23 },
  label: { color: '#123365', fontSize: 17, fontWeight: '700' },
  rowText: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF',
    borderColor: '#D9E5F2', borderWidth: 1, borderRadius: 15, padding: 16 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#B8CDE3', borderWidth: 1, borderRadius: 12,
    padding: 14, color: '#123365', fontSize: 16 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#F7DB82', color: '#342900', padding: 9,
    borderRadius: 8, fontWeight: '700' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { backgroundColor: '#D8EEFC', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  selected: { backgroundColor: '#123365' },
  selectedText: { color: '#FFFFFF' },
});
