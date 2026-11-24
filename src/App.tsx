import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampusContent } from './campus-content';
import { directionsUrl, eventSchedule, matches, universityNewsUrl, type CampusEvent, type Place, type Service } from './content';

type Tab = 'Home' | 'Explore' | 'What’s On' | 'Services';
type Detail = { kind: 'place' | 'event' | 'service'; id: string };
type Icon = keyof typeof Ionicons.glyphMap;

const colors = {
  navy: '#092E5D',
  ink: '#101A36',
  muted: '#354D6D',
  paper: '#F1F6FE',
  white: '#FFFFFF',
  border: '#D3DFEF',
  sky: '#CCE8FC',
  blueWash: '#E3EDFA',
  gold: '#FFC515',
};

const quickServices = ['student-affairs', 'library', 'student-portal'];

function Glyph({ name, size = 23, color = colors.navy }: { name: Icon; size?: number; color?: string }) {
  return <Ionicons accessible={false} aria-hidden name={name} size={size} color={color} />;
}

async function openLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Couldn’t open the link', 'Check your connection and try again.');
  }
}

function shareEvent(event: CampusEvent) {
  const source = event.sourceUrl ? '\n' + event.sourceUrl : '';
  void Share.share({ message: event.name + ' · ' + eventSchedule(event) + source })
    .catch(() => Alert.alert('Couldn’t share the event', 'Try again.'));
}

function placeMapUrl(place: Place) {
  return place.mapUrl ?? (place.mapQuery ? directionsUrl(place.mapQuery) : undefined);
}

function placeIcon(place: Place): Icon {
  if (place.category === 'Study') return 'book-outline';
  if (place.category === 'Health') return 'medkit-outline';
  return 'location-outline';
}

function serviceIcon(service: Service): Icon {
  if (service.id === 'library' || service.category === 'Academic support') return 'book-outline';
  if (service.category === 'Registration and fees') return 'laptop-outline';
  if (service.category === 'Health') return 'medkit-outline';
  if (service.category === 'Records and certificates') return 'document-text-outline';
  return 'people-outline';
}

function Row({ title, subtitle, icon, selected, highlighted = selected, onPress }: {
  title: string; subtitle?: string; icon?: Icon; selected?: boolean; highlighted?: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button"
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={({ pressed }) => [styles.row, highlighted && styles.selectedRow, pressed && styles.pressed]}
      onPress={onPress}>
      {icon && <View style={[styles.rowIcon, highlighted && styles.selectedIcon]}><Glyph name={icon} size={26} /></View>}
      <View style={styles.rowText}>
        <Text style={styles.label}>{title}</Text>
        {subtitle && <Text style={styles.body}>{subtitle}</Text>}
      </View>
      <Glyph name="chevron-forward" size={19} />
    </Pressable>
  );
}

function Action({ title, icon, secondary = false, onPress }: {
  title: string; icon: Icon; secondary?: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}
      style={({ pressed }) => [styles.action, secondary && styles.secondaryAction, pressed && styles.pressed]}>
      <Glyph name={icon} color={secondary ? colors.ink : colors.white} size={21} />
      <Text style={[styles.actionText, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

function Search({ value, onChangeText, placeholder }: {
  value: string; onChangeText: (value: string) => void; placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.search, focused && styles.searchFocused]}>
      <Glyph name="search-outline" color={colors.ink} />
      <TextInput accessibilityLabel={placeholder} placeholder={placeholder} placeholderTextColor={colors.muted}
        value={value} onChangeText={onChangeText} style={styles.input} returnKeyType="search"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoCorrect={false} />
      {value.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear search"
        onPress={() => onChangeText('')} style={styles.clearSearch}>
        <Glyph name="close-circle" size={19} />
      </Pressable>}
    </View>
  );
}

function Landmark({ place }: { place: Place }) {
  return (
    <View style={styles.landmark}>
      <Glyph name="location" size={25} />
      <View style={styles.rowText}>
        <Text style={styles.label}>Nearest landmark</Text>
        <Text style={styles.body}>{place.landmark}</Text>
      </View>
    </View>
  );
}

function ServiceCard({ service, place, openPlace }: {
  service: Service; place?: Place; openPlace: (id: string) => void;
}) {
  const { officialUrl } = service;
  return (
    <View style={styles.serviceCard}>
      <Text style={styles.section}>{service.name}</Text>
      <Text style={styles.body}>{service.description}</Text>
      {service.contact && <Text style={styles.body}>{service.contact}</Text>}
      {place && <Action title="View location" icon="business-outline" onPress={() => openPlace(place.id)} />}
      {officialUrl && <Action title="Open official website" icon="open-outline" secondary={Boolean(place)}
        onPress={() => void openLink(officialUrl)} />}
    </View>
  );
}

function EventCard({ event, venue, openDetails, openPlace }: {
  event: CampusEvent; venue?: Place; openDetails?: () => void; openPlace: (id: string) => void;
}) {
  const { sourceUrl } = event;
  return (
    <View style={styles.eventCard}>
      {openDetails && <View style={[styles.media, styles.eventPhoto]}>
        <Image source={require('../assets/preview/meetup.jpg')} style={styles.mediaImage} accessible={false} />
        <Text style={styles.caption}>Illustrative photo</Text>
      </View>}
      {openDetails
        ? <Pressable accessibilityRole="button" accessibilityLabel={'Event details for ' + event.name} onPress={openDetails}>
          <Text style={styles.featureTitle}>{event.name}</Text>
        </Pressable>
        : <Text accessibilityRole="header" style={styles.featureTitle}>{event.name}</Text>}
      <View style={styles.eventMeta}>
        <Glyph name="calendar-outline" size={21} />
        <Text style={styles.schedule}>{eventSchedule(event)}</Text>
        <Text style={styles.cost}>{event.cost}</Text>
      </View>
      {!openDetails && <>
        <Text style={styles.body}>{event.description}</Text>
        <Text style={styles.body}>Organiser · {event.organiser}</Text>
      </>}
      {!venue && event.externalVenue && <Text style={styles.body}>Venue · {event.externalVenue}</Text>}
      <View style={styles.eventActions}>
        {venue && <View style={styles.eventAction}><Action title="View venue" icon="location"
          onPress={() => openPlace(venue.id)} /></View>}
        {!venue && sourceUrl && <View style={styles.eventAction}><Action title="Event notice" icon="open-outline"
          onPress={() => void openLink(sourceUrl)} /></View>}
        <View style={styles.eventAction}><Action title="Share" icon="share-social" secondary
          onPress={() => shareEvent(event)} /></View>
      </View>
      {venue && sourceUrl && <Row title="Read the university announcement" icon="open-outline"
        onPress={() => void openLink(sourceUrl)} />}
    </View>
  );
}

export function Guide({ tab = 'Home', detail }: { tab?: Tab; detail?: Detail }) {
  const router = useRouter();
  const { content: { places, events, services, announcements }, status, retry } = useCampusContent();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedService, setSelectedService] = useState<string>();
  const available = status === 'ready' || status === 'sample';
  const home = !detail && tab === 'Home';
  const explore = !detail && tab === 'Explore';
  const whatsOn = !detail && tab === 'What’s On';
  const directory = !detail && tab === 'Services';
  const searching = Boolean(query.trim());
  const place = detail?.kind === 'place' ? places.find(item => item.id === detail.id) : undefined;
  const event = detail?.kind === 'event' ? events.find(item => item.id === detail.id) : undefined;
  const service = detail?.kind === 'service' ? services.find(item => item.id === detail.id) : undefined;
  const placeSource = place?.sourceUrl;
  const mapUrl = place && placeMapUrl(place);

  function open(kind: Detail['kind'], id: string) {
    const pathname = kind === 'place' ? '/place/[id]' : kind === 'event' ? '/event/[id]' : '/service/[id]';
    router.push({ pathname, params: { id } });
  }

  const openPlace = (id: string) => open('place', id);
  const visiblePlaces = places.filter(item =>
    (!explore || category === 'All' || item.category === category) &&
    matches(query, [item.name, item.category, item.campusArea, item.landmark, ...item.aliases]));
  const visibleServices = services.filter(item => matches(query, [item.name, item.description, item.category]));
  const orderedServices = [
    ...quickServices.flatMap(id => visibleServices.filter(item => item.id === id)),
    ...visibleServices.filter(item => !quickServices.includes(item.id)),
  ];
  const activeService = orderedServices.find(item => item.id === selectedService) ?? orderedServices[0];
  const serviceRows = orderedServices.slice(0, 3);
  const upcomingEvents = events.filter(item => Date.parse(item.endsAt ?? item.startsAt) > Date.now());
  const [featuredEvent, ...moreEvents] = upcomingEvents;
  const featuredPlace = visiblePlaces[0];
  const featuredMapUrl = featuredPlace && placeMapUrl(featuredPlace);
  const searchPlaceholder = explore ? 'Search places' : directory ? 'Search services' : 'Find a place or service';
  const title = detail
    ? place?.name ?? service?.name ?? (event || !available ? 'Campus Guide' : 'Listing unavailable')
    : home ? 'Campus Guide' : tab;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={home ? styles.navyInset : styles.screen}
        edges={detail ? ['left', 'right', 'bottom'] : ['top', 'left', 'right']}>
        <StatusBar barStyle={home ? 'light-content' : 'dark-content'} />
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {home ? <View style={styles.homeHeader}>
            <View pointerEvents="none" style={styles.heroBackground}>
              <View style={styles.heroCurve} />
            </View>
            <Text accessibilityRole="header" style={[styles.heading, styles.homeTitle]}>{title}</Text>
            <Text style={styles.brand}>UNIPORT</Text>
            {available && <Search value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />}
          </View> : <>
            {!event && <Text accessibilityRole="header" style={styles.heading}>{title}</Text>}
            {available && (explore || directory) && <Search value={query} onChangeText={setQuery}
              placeholder={searchPlaceholder} />}
          </>}

          {status === 'loading' && <Text accessibilityLiveRegion="polite" style={styles.body}>Loading campus listings…</Text>}
          {status === 'error' && <Row title="Try again" subtitle="Campus listings couldn’t load." onPress={retry} />}

          {available && home && !searching && <>
            <View style={[styles.media, styles.campusPhoto]}>
              <Image source={require('../assets/preview/campus.jpg')} style={styles.mediaImage}
                accessible accessibilityLabel="Illustrative photo of students walking on campus" />
            </View>
            <Text accessibilityRole="header" style={styles.section}>Coming up</Text>
            {featuredEvent ? <Row title={featuredEvent.name} subtitle={eventSchedule(featuredEvent)}
              icon="calendar-outline" onPress={() => open('event', featuredEvent.id)} />
              : <Text style={styles.body}>No upcoming events listed.</Text>}
            <Row title="Student services" icon="people" highlighted onPress={() => router.navigate('/services')} />
            <Text accessibilityRole="header" style={styles.section}>Campus notices</Text>
            {announcements.length === 0 && <Text style={styles.body}>No campus notices.</Text>}
            {announcements.map(({ id, title: notice, summary, sourceUrl }) => sourceUrl
              ? <Row key={id} title={notice} subtitle={summary} onPress={() => void openLink(sourceUrl)} />
              : <View key={id} style={styles.serviceCard}><Text style={styles.label}>{notice}</Text>
                <Text style={styles.body}>{summary}</Text></View>)}
          </>}

          {available && home && searching && <>
            {visiblePlaces.map(item => <Row key={item.id} title={item.name} subtitle={item.campusArea}
              icon={placeIcon(item)} onPress={() => openPlace(item.id)} />)}
            {visibleServices.map(item => <Row key={item.id} title={item.name} subtitle={item.category}
              icon={serviceIcon(item)} onPress={() => open('service', item.id)} />)}
            {!visiblePlaces.length && !visibleServices.length && <Text style={styles.body}>No matching places or services.</Text>}
          </>}

          {available && explore && <>
            {!searching && featuredPlace && <>
              <View style={[styles.media, styles.mapPhoto]}>
                <Image style={styles.mediaImage} source={require('../assets/preview/campus-map.webp')} accessible={false} />
                <Text style={styles.caption}>Illustrative campus map</Text>
              </View>
              <View style={styles.featurePlace}>
                <View style={styles.placeIcon}><Glyph name={placeIcon(featuredPlace)} size={38} /></View>
                <View style={styles.rowText}>
                  <Pressable accessibilityRole="button" style={styles.placeLink} onPress={() => openPlace(featuredPlace.id)}>
                    <Text style={[styles.label, styles.placeName]}>{featuredPlace.name}</Text>
                    <Glyph name="chevron-forward" size={17} />
                  </Pressable>
                  {featuredMapUrl && <Action title="Directions" icon="navigate-outline" onPress={() => void openLink(featuredMapUrl)} />}
                </View>
              </View>
              <Landmark place={featuredPlace} />
            </>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" contentContainerStyle={styles.filters}>
              {['All', ...new Set(places.map(item => item.category))].map(item => (
                <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }}
                  onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.activeFilter]}>
                  <Text style={[styles.filterText, category === item && styles.actionText]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {(searching ? visiblePlaces : visiblePlaces.slice(1)).map(item => (
              <Row key={item.id} title={item.name} subtitle={item.campusArea} icon={placeIcon(item)}
                onPress={() => openPlace(item.id)} />
            ))}
            {!visiblePlaces.length && <Text style={styles.body}>No matching places.</Text>}
          </>}

          {available && whatsOn && <>
            {featuredEvent ? <EventCard event={featuredEvent} venue={places.find(item => item.id === featuredEvent.placeId)}
              openDetails={() => open('event', featuredEvent.id)} openPlace={openPlace} /> : <Text style={styles.body}>No upcoming events listed.</Text>}
            {moreEvents.length > 0 && <View style={styles.moreEvents}>
              {moreEvents.map(item => <Row key={item.id} title={item.name} subtitle={eventSchedule(item)}
                icon="calendar-outline" onPress={() => open('event', item.id)} />)}
            </View>}
            <Row title="University news and events" subtitle="Check for new dates and venue updates"
              icon="open-outline" onPress={() => void openLink(universityNewsUrl)} />
          </>}

          {available && directory && <>
            <View style={styles.serviceRows}>
              {serviceRows.map(item => <Row key={item.id} title={item.name} icon={serviceIcon(item)}
                selected={item.id === activeService?.id} onPress={() => setSelectedService(item.id)} />)}
            </View>
            {activeService && <ServiceCard service={activeService} place={places.find(item => item.id === activeService.placeId)}
              openPlace={openPlace} />}
            {orderedServices.slice(3).map(item => <Row key={item.id} title={item.name} icon={serviceIcon(item)}
              onPress={() => open('service', item.id)} />)}
            {!orderedServices.length && <Text style={styles.body}>No matching services.</Text>}
          </>}

          {event && <EventCard event={event} venue={places.find(item => item.id === event.placeId)} openPlace={openPlace} />}
          {service && <ServiceCard service={service} place={places.find(item => item.id === service.placeId)}
            openPlace={openPlace} />}
          {place && <>
            <Text style={styles.body}>{place.category} · {place.campusArea}</Text>
            <Landmark place={place} />
            <Text style={styles.section}>Directions</Text>
            <Text style={styles.body}>{place.directions}</Text>
            {mapUrl && <Action title="Open in Maps" icon="navigate-outline" onPress={() => void openLink(mapUrl)} />}
            {placeSource && <Row title="University source" icon="open-outline" onPress={() => void openLink(placeSource)} />}
          </>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  navyInset: { flex: 1, backgroundColor: colors.navy },
  content: { alignSelf: 'center', width: '100%', maxWidth: 610, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30, gap: 14 },
  homeHeader: { marginTop: -16, marginHorizontal: -16, paddingTop: 14, paddingHorizontal: 19, paddingBottom: 10 },
  heroBackground: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', backgroundColor: '#A8DDF9', borderBottomLeftRadius: 42, borderBottomRightRadius: 24 },
  heroCurve: { position: 'absolute', top: -115, left: '-25%', width: '141%', height: '157%', borderBottomRightRadius: '70%',
    borderBottomLeftRadius: '44%', backgroundColor: colors.navy, transform: [{ rotate: '-12deg' }] },
  heading: { color: colors.navy, fontSize: 38, fontWeight: '900', letterSpacing: -1.15 },
  homeTitle: { color: colors.white },
  brand: { color: colors.gold, fontSize: 28, fontWeight: '900', letterSpacing: -0.45, marginBottom: 18 },
  section: { color: colors.navy, fontSize: 27, fontWeight: '900', letterSpacing: -0.7 },
  featureTitle: { color: colors.navy, fontSize: 29, fontWeight: '900', letterSpacing: -0.75 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.23 },
  rowText: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFE',
    borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 12, minHeight: 59 },
  selectedRow: { backgroundColor: colors.sky, borderColor: colors.sky },
  rowIcon: { alignItems: 'center', justifyContent: 'center', width: 40, height: 42, borderRadius: 12, backgroundColor: colors.sky },
  selectedIcon: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.75 },
  search: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 15,
    minHeight: 51, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
    boxShadow: '0 2px 4px rgba(9,46,93,0.12)' },
  searchFocused: { borderColor: colors.navy },
  input: { flex: 1, color: colors.ink, fontSize: 16, minHeight: 48, paddingVertical: 8 },
  clearSearch: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', marginRight: -12 },
  media: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.sky },
  mediaImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  campusPhoto: { aspectRatio: 1.66 },
  mapPhoto: { aspectRatio: 1.43, backgroundColor: '#AFD18D' },
  eventPhoto: { aspectRatio: 1.56 },
  caption: { position: 'absolute', right: 8, bottom: 8, color: colors.ink, backgroundColor: colors.white,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, fontSize: 11, fontWeight: '700' },
  featurePlace: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  placeIcon: { width: '29%', maxWidth: 115, minHeight: 90, borderRadius: 14, backgroundColor: colors.sky,
    alignItems: 'center', justifyContent: 'center' },
  placeLink: { minHeight: 44, flexDirection: 'row', gap: 5, alignItems: 'center', paddingBottom: 5 },
  placeName: { flex: 1, color: colors.navy },
  landmark: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: 16, backgroundColor: colors.blueWash },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 48, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.navy },
  secondaryAction: { backgroundColor: '#F8FAFE', borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.white, fontWeight: '800', fontSize: 15, textAlign: 'center', flexShrink: 1 },
  secondaryText: { color: colors.ink },
  serviceRows: { gap: 8 },
  serviceCard: { padding: 15, gap: 10, borderRadius: 17, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.blueWash },
  eventCard: { gap: 10 },
  eventMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  schedule: { fontSize: 15, color: colors.ink, flexShrink: 1 },
  cost: { backgroundColor: colors.gold, color: colors.ink, paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 10, fontWeight: '800' },
  eventActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 5 },
  eventAction: { flexGrow: 1, flexBasis: 115 },
  moreEvents: { gap: 8, paddingTop: 14, borderTopColor: colors.border, borderTopWidth: 1 },
  filters: { flexDirection: 'row', gap: 7 },
  filter: { backgroundColor: colors.blueWash, paddingHorizontal: 13, paddingVertical: 9, minHeight: 44,
    justifyContent: 'center', borderRadius: 11 },
  activeFilter: { backgroundColor: colors.navy },
  filterText: { color: colors.navy, fontSize: 14, fontWeight: '700' },
});
