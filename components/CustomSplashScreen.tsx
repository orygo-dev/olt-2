import React from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Router as RouterIcon } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function CustomSplashScreen() {
  const { appName, logoUrl, splashBackgroundUrl } = useSelector((state: RootState) => state.settings);

  return (
    <SafeAreaView style={styles.container}>
      {splashBackgroundUrl ? (
        <Image source={{ uri: splashBackgroundUrl }} style={styles.backgroundImage} resizeMode="cover" />
      ) : null}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000 }}
        style={styles.logoContainer}
      >
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
        ) : (
          <RouterIcon color={Colors.primary} size={80} />
        )}
        <Text style={styles.appName}>{appName}</Text>
      </MotiView>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    marginTop: 20,
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
  },
});
