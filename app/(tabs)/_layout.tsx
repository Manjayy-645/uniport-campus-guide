import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

const icons = { home: '⌂', explore: '◎', events: '▦', services: '≡' };

function tabIcon(icon: keyof typeof icons) {
  return ({ color }: { color: string }) => (
    <Text accessible={false} importantForAccessibility="no" style={[styles.icon, { color }]}>
      {icons[icon]}
    </Text>
  );
}

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: '#FFFFFF',
    tabBarActiveBackgroundColor: '#123365',
    tabBarInactiveTintColor: '#354E70',
    tabBarLabelPosition: 'below-icon',
    tabBarLabelStyle: styles.label,
    tabBarItemStyle: styles.item,
    tabBarStyle: styles.bar,
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
    <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: tabIcon('explore') }} />
    <Tabs.Screen name="events" options={{ title: 'What’s On', tabBarIcon: tabIcon('events') }} />
    <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: tabIcon('services') }} />
  </Tabs>;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: '#FFFFFF', borderTopColor: '#D9E5F2' },
  item: { borderRadius: 12, marginHorizontal: 4, marginVertical: 3 },
  label: { fontSize: 11, fontWeight: '700' },
  icon: { fontSize: 21, lineHeight: 23, fontWeight: '700' },
});
