import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colors: string[];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function StatCard({ icon, label, value, colors, onPress, style }: StatCardProps) {
  return (
    <MotiView
      style={[styles.container, style]}
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
    >
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.95 : 1 }}
            transition={{ type: 'timing', duration: 150 }}
          >
            <LinearGradient colors={colors} style={styles.gradient}>
              {icon}
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.label}>{label}</Text>
            </LinearGradient>
          </MotiView>
        )}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 150,
  },
  value: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.white,
    marginTop: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
});
