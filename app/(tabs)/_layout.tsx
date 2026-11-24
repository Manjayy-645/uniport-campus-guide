import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function tabIcon(active: keyof typeof Ionicons.glyphMap, inactive: keyof typeof Ionicons.glyphMap) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons accessible={false} aria-hidden name={focused ? active : inactive} color={color} size={23} />
  );
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FFFFFF',
      tabBarActiveBackgroundColor: '#092E5D',
      tabBarInactiveTintColor: '#101A2E',
      tabBarLabelPosition: 'below-icon',
      tabBarLabelStyle: styles.label,
      tabBarItemStyle: styles.item,
      tabBarStyle: [styles.bar, { height: 69 + bottom }],
      tabBarHideOnKeyboard: true,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: tabIcon('compass', 'compass-outline') }} />
      <Tabs.Screen name="events" options={{ title: 'What’s On', tabBarIcon: tabIcon('calendar', 'calendar-outline') }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: tabIcon('layers', 'layers-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: '#F5F8FE', borderTopColor: '#D7E2EF', paddingHorizontal: 8 },
  item: { borderRadius: 15, overflow: 'hidden', marginHorizontal: 3, marginVertical: 5, minHeight: 44 },
  label: { fontSize: 11, fontWeight: '700' },
});
