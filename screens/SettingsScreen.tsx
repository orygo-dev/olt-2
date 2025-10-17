import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, persistor } from '../store';
import { setAppName, setAiModel, setLogoUrl, setSplashBackgroundUrl, setAiApiConnection } from '../store/settingsSlice';
import { logout } from '../store/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Save, Bot, Image as ImageIcon, ChevronDown, PaintBucket, LogOut, Link as LinkIcon } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

const AI_MODELS = ['Model Analisis V1', 'Model Prediksi Lanjutan V2', 'Model Eksperimental V3'];

export default function SettingsScreen() {
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Colors.card);
      }
    }, [])
  );

  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);

  const [localAppName, setLocalAppName] = useState(settings.appName);
  const [localAiModel, setLocalAiModel] = useState(settings.aiModel);
  const [localAiApi, setLocalAiApi] = useState(settings.aiApiConnection);
  const [showAiPicker, setShowAiPicker] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSaveChanges = () => {
    dispatch(setAppName(localAppName));
    dispatch(setAiModel(localAiModel));
    dispatch(setAiApiConnection(localAiApi));
    Alert.alert('Tersimpan', 'Pengaturan telah berhasil disimpan.');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pengaturan Aplikasi</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branding</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Aplikasi</Text>
            <TextInput
              style={styles.input}
              value={localAppName}
              onChangeText={setLocalAppName}
              placeholder="Masukkan nama aplikasi"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Logo Aplikasi</Text>
            <TouchableOpacity style={styles.logoButton} onPress={() => Alert.alert('Fitur Segera Hadir', 'Fungsi unggah logo akan tersedia di versi selanjutnya.')}>
              <ImageIcon color={Colors.primary} size={20} />
              <Text style={styles.logoButtonText}>Pilih File Logo</Text>
            </TouchableOpacity>
          </View>
           <View style={styles.inputGroup}>
            <Text style={styles.label}>Background Splash Screen</Text>
            <TouchableOpacity style={styles.logoButton} onPress={() => Alert.alert('Fitur Segera Hadir', 'Fungsi unggah background akan tersedia di versi selanjutnya.')}>
              <PaintBucket color={Colors.primary} size={20} />
              <Text style={styles.logoButtonText}>Pilih Gambar Background</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analisis AI</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Koneksi API AI</Text>
            <View style={styles.inputIconContainer}>
              <LinkIcon color={Colors.textSecondary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingLeft: 40 }]}
                value={localAiApi}
                onChangeText={setLocalAiApi}
                placeholder="Masukkan URL atau Key API"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model AI Aktif</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAiPicker(!showAiPicker)}>
              <Bot color={Colors.textSecondary} size={20} />
              <Text style={styles.pickerButtonText}>{localAiModel}</Text>
              <ChevronDown color={Colors.textSecondary} size={20} />
            </TouchableOpacity>
            {showAiPicker && (
              <View style={styles.pickerOptionsContainer}>
                {AI_MODELS.map((model, index) => (
                  <TouchableOpacity
                    key={model}
                    style={[styles.pickerOption, index === AI_MODELS.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => {
                      setLocalAiModel(model);
                      setShowAiPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        localAiModel === model && styles.pickerOptionTextActive
                      ]}
                    >
                      {model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Save color={Colors.white} size={20} />
          <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color={Colors.offline} size="small" />
          ) : (
            <>
              <LogOut color={Colors.offline} size={20} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  inputIconContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: 10,
  },
  logoButtonText: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerButtonText: {
    flex: 1,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  pickerOptionsContainer: {
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  pickerOptionTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.offline,
    minHeight: 55,
  },
  logoutButtonText: {
    color: Colors.offline,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
