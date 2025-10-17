import React, { useState } from 'react';
import { Tabs, usePathname, Link, Slot, Redirect } from 'expo-router';
import { LayoutDashboard, Server, Router as RouterIcon, Settings, Users, LogOut } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Platform, useWindowDimensions, View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, persistor } from '../../store';
import { logout } from '../../store/authSlice';

const SidebarLink = ({ href, title, icon: Icon }: { href: any, title: string, icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={[
            styles.sidebarLink,
            isActive && styles.sidebarLinkActive,
            pressed && styles.sidebarLinkPressed
          ]}>
            <Icon color={isActive ? Colors.primary : Colors.textSecondary} size={22} />
            <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
};

const DesktopLayout = () => {
  const { appName } = useSelector((state: RootState) => state.settings);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
             // No need to setIsLoggingOut(false) as the component will unmount.
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.background }}>
      <View style={styles.sidebar}>
        <View>
          <View style={styles.sidebarHeader}>
            <RouterIcon color={Colors.primary} size={32} />
            <Text style={styles.sidebarTitle}>{appName}</Text>
          </View>
          <View style={styles.sidebarNav}>
            <SidebarLink href="/(tabs)/" title="Dasbor" icon={LayoutDashboard} />
            <SidebarLink href="/(tabs)/olt" title="Manajemen OLT" icon={Server} />
            <SidebarLink href="/(tabs)/onu" title="Manajemen ONU" icon={RouterIcon} />
            {user?.role === 'super-admin' && (
              <>
                <SidebarLink href="/(tabs)/users" title="Pengguna" icon={Users} />
                <SidebarLink href="/(tabs)/settings" title="Pengaturan" icon={Settings} />
              </>
            )}
          </View>
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
            <Text style={styles.userRole} numberOfLines={1}>{user?.position}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut} style={styles.logoutIcon}>
            {isLoggingOut ? <ActivityIndicator color={Colors.primary} size="small" /> : <LogOut color={Colors.textSecondary} size={24} />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentArea}>
        <Slot />
      </View>
    </SafeAreaView>
  );
};

const MobileLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10, // Ukuran teks diperkecil
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dasbor',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="olt"
        options={{
          title: 'Manajemen OLT',
          tabBarIcon: ({ color, size }) => <Server color={color} size={size} />,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.primary,
        }}
      />
      <Tabs.Screen
        name="onu"
        options={{
          title: 'Manajemen ONU',
          tabBarIcon: ({ color, size }) => <RouterIcon color={color} size={size} />,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.primary,
        }}
      />
       <Tabs.Screen
        name="users"
        options={{
          title: 'Pengguna',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.primary,
          href: user?.role === 'super-admin' ? '/(tabs)/users' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.primary,
          href: user?.role === 'super-admin' ? '/(tabs)/settings' : null,
        }}
      />
    </Tabs>
  );
};

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isDesktop = width >= 768;

  if (!isAuthenticated) {
    // This check is handled by the root layout, but provides an extra layer of safety.
    return <Redirect href="/login" />;
  }

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: Colors.card,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    padding: 16,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sidebarTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    flex: 1,
  },
  sidebarNav: {
    gap: 8,
  },
  sidebarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  sidebarLinkActive: {
    backgroundColor: '#eff6ff',
  },
  sidebarLinkPressed: {
    backgroundColor: '#dbeafe',
  },
  sidebarLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  sidebarLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  contentArea: {
    flex: 1,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  logoutIcon: {
    padding: 8,
  },
});
