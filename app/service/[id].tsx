import { useLocalSearchParams } from 'expo-router';
import { Guide } from '../../src/App';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Guide detail={{ kind: 'service', id }} />;
}
