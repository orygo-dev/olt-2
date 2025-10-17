import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, persistor } from '../store';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Server, Router as RouterIcon, Wifi, WifiOff, Network, Waypoints, Users, LogOut } from 'lucide-react-native';
import StatCard from '../components/StatCard';
import { Colors } from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { logout } from '../store/authSlice';

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { appName } = useSelector((state: RootState) => state.settings);
  const { user } = useSelector((state: RootState) => state.auth);
  const allOlts = useSelector((state: RootState) => state.olt.olts);
  const allOnus = useSelector((state: RootState) => state.onu.onus);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { olts, onus } = useMemo(() => {
    if (user?.role === 'teknisi' && user.location) {
      const filteredOlts = allOlts.filter(olt => olt.location === user.location);
      const filteredOltIds = filteredOlts.map(olt => olt.id);
      const filteredOnus = allOnus.filter(onu => filteredOltIds.includes(onu.oltId));
      return { olts: filteredOlts, onus: filteredOnus };
    }
    return { olts: allOlts, onus: allOnus };
  }, [user, allOlts, allOnus]);

  const totalOLT = olts.length;
  const onlineONU = onus.filter(onu => onu.status === 'online').length;
  const offlineONU = onus.filter(onu => onu.status === 'offline').length;
  const bridgeONU = onus.filter(onu => onu.mode === 'bridge').length;
  const pppoeONU = onus.filter(onu => onu.mode === 'pppoe').length;
  const totalUsers = useSelector((state: RootState) => state.auth.users.length);

  const handleNavigate = (filter: string, type: 'status' | 'mode') => {
    router.push({
      pathname: '/(tabs)/onu',
      params: { filter, type },
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          if (isLoggingOut) return;
          setIsLoggingOut(true);
          dispatch(logout());
          persistor.purge().finally(() => {
             // The RootLayout will handle the redirection.
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={isDesktop ? [] : ['top']}>
      <StatusBar style="light" />
      {!isDesktop && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <RouterIcon color={Colors.primary} size={32} />
            <Text style={styles.headerTitle}>{appName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut} style={styles.logoutButton}>
            {isLoggingOut ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <LogOut color={Colors.primary} size={26} />
            )}
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {isDesktop && (
           <Text style={styles.desktopTitle}>Dasbor Monitoring</Text>
        )}
        <View style={styles.cardRow}>
          <StatCard
            icon={<Server color={Colors.white} size={32} />}
            label="Total OLT"
            value={totalOLT}
            colors={['#3b82f6', '#2563eb']}
            onPress={() => router.push('/(tabs)/olt')}
            style={{ marginRight: 8 }}
          />
          <StatCard
            icon={<RouterIcon color={Colors.white} size={32} />}
            label="Total ONU"
            value={onus.length}
            colors={['#a78bfa', '#8b5cf6']}
            onPress={() => handleNavigate('all', 'status')}
            style={{ marginLeft: 8 }}
          />
        </View>
        <View style={styles.cardRow}>
          <StatCard
            icon={<Wifi color={Colors.white} size={32} />}
            label="ONU Online"
            value={onlineONU}
            colors={['#22c55e', '#16a34a']}
            onPress={() => handleNavigate('online', 'status')}
            style={{ marginRight: 8 }}
          />
          <StatCard
            icon={<WifiOff color={Colors.white} size={32} />}
            label="ONU Offline"
            value={offlineONU}
            colors={['#f87171', '#ef4444']}
            onPress={() => handleNavigate('offline', 'status')}
            style={{ marginLeft: 8 }}
          />
        </View>
        <View style={styles.cardRow}>
          <StatCard
            icon={<Network color={Colors.white} size={32} />}
            label="Mode Bridge"
            value={bridgeONU}
            colors={['#f97316', '#ea580c']}
            onPress={() => handleNavigate('bridge', 'mode')}
            style={{ marginRight: 8 }}
          />
          <StatCard
            icon={<Waypoints color={Colors.white} size={32} />}
            label="Mode PPPoE"
            value={pppoeONU}
            colors={['#ec4899', '#db2777']}
            onPress={() => handleNavigate('pppoe', 'mode')}
            style={{ marginLeft: 8 }}
          />
        </View>
        {user?.role === 'super-admin' && (
          <View style={styles.cardRow}>
            <StatCard
              icon={<Users color={Colors.white} size={32} />}
              label="Kelola Pengguna"
              value={totalUsers}
              colors={['#64748b', '#475569']}
              onPress={() => router.push('/(tabs)/users')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: Colors.text,
  },
  logoutButton: {
    padding: 4,
  },
  desktopTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 24,
  },
  content: {
    padding: 24,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});
