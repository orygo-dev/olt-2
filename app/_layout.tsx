import { useEffect, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector } from 'react-redux';
import { store, RootState, persistor } from '../store';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomSplashScreen from '../components/CustomSplashScreen';
import { PersistGate } from 'redux-persist/integration/react';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    // This effect will handle redirection based on authentication status.
    // It's designed to be robust and handle initial loading states.

    // If the user is not authenticated and is not on the login screen,
    // redirect them to the login screen.
    if (!isAuthenticated && segments[0] !== 'login') {
      router.replace('/login');
    } 
    // If the user is authenticated but is not in the main app section (e.g., on login or initial screen),
    // redirect them to the dashboard.
    else if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)/');
    }
  }, [isAuthenticated, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Show native splash screen until fonts are loaded.
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <Provider store={store}>
          <PersistGate
            loading={<CustomSplashScreen />} // Show custom splash screen while rehydrating.
            persistor={persistor}
          >
            <RootLayoutNav />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
