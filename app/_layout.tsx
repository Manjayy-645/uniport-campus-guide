import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerTintColor: '#123365' }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="place/[id]" options={{ title: 'Place' }} />
    <Stack.Screen name="event/[id]" options={{ title: 'Event' }} />
    <Stack.Screen name="service/[id]" options={{ title: 'Service' }} />
  </Stack>;
}
