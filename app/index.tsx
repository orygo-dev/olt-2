import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

// This screen is just a loading placeholder.
// The logic in _layout.tsx will handle the redirection.
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
