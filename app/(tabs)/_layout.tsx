import { Tabs } from 'expo-router';

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: '#123365',
    tabBarActiveBackgroundColor: '#D8EEFC',
    tabBarInactiveTintColor: '#354E70',
    tabBarLabelPosition: 'beside-icon',
    tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
    tabBarIcon: () => null,
    tabBarIconStyle: { display: 'none' },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    <Tabs.Screen name="events" options={{ title: 'What’s On' }} />
    <Tabs.Screen name="services" options={{ title: 'Services' }} />
  </Tabs>;
}
