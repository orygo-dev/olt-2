import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateONU, deleteONU, ONU } from '../store/onuSlice';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  Router as RouterIcon,
  Settings,
  X,
  Trash2,
  Filter,
  Wifi,
  Lock,
  LockOpen,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import AiAnalysisModal from '../components/AiAnalysisModal';

export default function ONUScreen() {
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Colors.card);
      }
    }, [])
  );

  const dispatch = useDispatch();
  const allOnus = useSelector((state: RootState) => state.onu.onus);
  const allOlts = useSelector((state: RootState) => state.olt.olts);
  const { user } = useSelector((state: RootState) => state.auth);

  const { olts, onus } = useMemo(() => {
    if (user?.role === 'teknisi' && user.location) {
      const filteredOlts = allOlts.filter(olt => olt.location === user.location);
      const filteredOltIds = filteredOlts.map(olt => olt.id);
      const filteredOnus = allOnus.filter(onu => filteredOltIds.includes(onu.oltId));
      return { olts: filteredOlts, onus: filteredOnus };
    }
    return { olts: allOlts, onus: allOnus };
  }, [user, allOlts, allOnus]);

  const params = useLocalSearchParams<{ filter?: string; type?: 'status' | 'mode' }>();

  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedONU, setSelectedONU] = useState<ONU | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'bridge' | 'pppoe'>('all');
  const [oltFilter, setOltFilter] = useState<string>('all');

  useFocusEffect(
    React.useCallback(() => {
      if (params.filter && params.type) {
        if (params.type === 'status') {
          setStatusFilter(params.filter as 'all' | 'online' | 'offline');
          setModeFilter('all');
        } else if (params.type === 'mode') {
          setModeFilter(params.filter as 'all' | 'bridge' | 'pppoe');
          setStatusFilter('all');
        }
        setOltFilter('all');
      }
    }, [params])
  );

  const filteredONUs = useMemo(() => {
    return onus.filter(onu => {
      const statusMatch = statusFilter === 'all' || onu.status === statusFilter;
      const oltMatch = oltFilter === 'all' || onu.oltId === oltFilter;
      const modeMatch = modeFilter === 'all' || onu.mode === modeFilter;
      return statusMatch && oltMatch && modeMatch;
    });
  }, [onus, statusFilter, oltFilter, modeFilter]);

  const handleConfigureONU = (onu: ONU) => {
    setSelectedONU(onu);
    setConfigData({
      mode: onu.mode,
      pppoeUsername: onu.pppoeUsername || '',
      pppoePassword: onu.pppoePassword || '',
      vlan: onu.vlan.toString(),
      portBinding: onu.portBinding,
      wlanSSID: onu.wlan.ssid,
      wlanSecurity: onu.wlan.security,
      wlanPassword: onu.wlan.password || '',
    });
    setConfigModalVisible(true);
  };

  const [configData, setConfigData] = useState({
    mode: 'pppoe' as 'pppoe' | 'bridge',
    pppoeUsername: '',
    pppoePassword: '',
    vlan: '',
    portBinding: [] as string[],
    wlanSSID: '',
    wlanSecurity: 'password' as 'open' | 'password',
    wlanPassword: '',
  });

  const handleSaveConfig = () => {
    if (!selectedONU) return;

    if (!configData.wlanSSID || !configData.vlan) {
      Alert.alert('Error', 'Silakan lengkapi field yang diperlukan');
      return;
    }

    if (configData.mode === 'pppoe' && (!configData.pppoeUsername || !configData.pppoePassword)) {
      Alert.alert('Error', 'Username dan password PPPoE wajib diisi untuk mode PPPoE');
      return;
    }

    if (configData.wlanSecurity === 'password' && !configData.wlanPassword) {
      Alert.alert('Error', 'Password WiFi wajib diisi untuk keamanan password');
      return;
    }

    const updatedONU: ONU = {
      ...selectedONU,
      mode: configData.mode,
      pppoeUsername: configData.mode === 'pppoe' ? configData.pppoeUsername : undefined,
      pppoePassword: configData.mode === 'pppoe' ? configData.pppoePassword : undefined,
      vlan: parseInt(configData.vlan),
      portBinding: configData.portBinding,
      wlan: {
        ssid: configData.wlanSSID,
        security: configData.wlanSecurity,
        password: configData.wlanSecurity === 'password' ? configData.wlanPassword : undefined,
      },
    };

    dispatch(updateONU(updatedONU));
    setConfigModalVisible(false);
    Alert.alert('Sukses', 'Konfigurasi ONU berhasil diperbarui');
  };

  const handleDeleteONU = (id: string) => {
    Alert.alert(
      'Hapus ONU',
      'Apakah Anda yakin ingin menghapus ONU ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteONU(id));
            setConfigModalVisible(false);
          },
        },
      ]
    );
  };

  const togglePortBinding = (port: string) => {
    setConfigData(prev => ({
      ...prev,
      portBinding: prev.portBinding.includes(port)
        ? prev.portBinding.filter(p => p !== port)
        : [...prev.portBinding, port],
    }));
  };

  const renderONUCard = ({ item }: { item: ONU }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleConfigureONU(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <RouterIcon color={Colors.primary} size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.oltName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'online' ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'online' ? '#166534' : '#991b1b' }]}>
            {item.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Serial Number:</Text>
          <Text style={styles.infoValue}>{item.serialNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Signal:</Text>
          <Text style={[styles.infoValue, { color: item.signalStrength > -25 ? Colors.online : Colors.offline }]}>
            {item.signalStrength} dBm
          </Text>
        </View>
      </View>

      <View style={styles.modeBadge}>
        <Text style={styles.modeText}>{item.mode.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter color={Colors.primary} size={20} />
          <Text style={styles.filterButtonText}>Filter</Text>
          {(statusFilter !== 'all' || oltFilter !== 'all' || modeFilter !== 'all') && (
            <View style={styles.filterDot} />
          )}
        </TouchableOpacity>
        <Text style={styles.resultText}>
          {filteredONUs.length} ONU ditemukan
        </Text>
      </View>

      <FlatList
        data={filteredONUs}
        renderItem={renderONUCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada ONU yang cocok dengan filter atau lokasi tugas Anda.</Text>}
      />

      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter ONU</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setStatusFilter('all')}
                >
                  <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
                    Semua
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, statusFilter === 'online' && styles.filterChipActive]}
                  onPress={() => setStatusFilter('online')}
                >
                  <Text style={[styles.filterChipText, statusFilter === 'online' && styles.filterChipTextActive]}>
                    Online
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, statusFilter === 'offline' && styles.filterChipActive]}
                  onPress={() => setStatusFilter('offline')}
                >
                  <Text style={[styles.filterChipText, statusFilter === 'offline' && styles.filterChipTextActive]}>
                    Offline
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.filterLabel, { marginTop: 20 }]}>Mode</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterChip, modeFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setModeFilter('all')}
                >
                  <Text style={[styles.filterChipText, modeFilter === 'all' && styles.filterChipTextActive]}>
                    Semua
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, modeFilter === 'bridge' && styles.filterChipActive]}
                  onPress={() => setModeFilter('bridge')}
                >
                  <Text style={[styles.filterChipText, modeFilter === 'bridge' && styles.filterChipTextActive]}>
                    Bridge
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, modeFilter === 'pppoe' && styles.filterChipActive]}
                  onPress={() => setModeFilter('pppoe')}
                >
                  <Text style={[styles.filterChipText, modeFilter === 'pppoe' && styles.filterChipTextActive]}>
                    PPPoE
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.filterLabel, { marginTop: 20 }]}>OLT</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterChip, oltFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setOltFilter('all')}
                >
                  <Text style={[styles.filterChipText, oltFilter === 'all' && styles.filterChipTextActive]}>
                    Semua OLT
                  </Text>
                </TouchableOpacity>
                {olts.map(olt => (
                  <TouchableOpacity
                    key={olt.id}
                    style={[styles.filterChip, oltFilter === olt.id && styles.filterChipActive]}
                    onPress={() => setOltFilter(olt.id)}
                  >
                    <Text style={[styles.filterChipText, oltFilter === olt.id && styles.filterChipTextActive]}>
                      {olt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={configModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedONU && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Konfigurasi ONU</Text>
                  <TouchableOpacity onPress={() => setConfigModalVisible(false)}>
                    <X color={Colors.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                  <View style={styles.onuInfoCard}>
                    <Text style={styles.onuInfoTitle}>{selectedONU.name}</Text>
                    <Text style={styles.onuInfoSubtitle}>{selectedONU.serialNumber}</Text>
                  </View>

                  {selectedONU.status === 'offline' && (
                    <TouchableOpacity style={styles.aiButton} onPress={() => setAiModalVisible(true)}>
                      <Sparkles color={Colors.white} size={20} />
                      <Text style={styles.aiButtonText}>Analisa Kabel Putus (AI)</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mode Koneksi</Text>
                    <View style={styles.modeSelector}>
                      <TouchableOpacity
                        style={[styles.modeOption, configData.mode === 'pppoe' && styles.modeOptionActive]}
                        onPress={() => setConfigData({ ...configData, mode: 'pppoe' })}
                      >
                        <Text style={[styles.modeOptionText, configData.mode === 'pppoe' && styles.modeOptionTextActive]}>
                          PPPoE
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modeOption, configData.mode === 'bridge' && styles.modeOptionActive]}
                        onPress={() => setConfigData({ ...configData, mode: 'bridge' })}
                      >
                        <Text style={[styles.modeOptionText, configData.mode === 'bridge' && styles.modeOptionTextActive]}>
                          Bridge
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {configData.mode === 'pppoe' && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username PPPoE *</Text>
                        <TextInput
                          style={styles.input}
                          value={configData.pppoeUsername}
                          onChangeText={text => setConfigData({ ...configData, pppoeUsername: text })}
                          placeholder="user@isp.net"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password PPPoE *</Text>
                        <TextInput
                          style={styles.input}
                          value={configData.pppoePassword}
                          onChangeText={text => setConfigData({ ...configData, pppoePassword: text })}
                          placeholder="••••••••"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>VLAN ID *</Text>
                    <TextInput
                      style={styles.input}
                      value={configData.vlan}
                      onChangeText={text => setConfigData({ ...configData, vlan: text })}
                      placeholder="100"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Port Binding</Text>
                    <View style={styles.portBindingContainer}>
                      {['LAN1', 'LAN2', 'LAN3', 'LAN4'].map(port => (
                        <TouchableOpacity
                          key={port}
                          style={[
                            styles.portChip,
                            configData.portBinding.includes(port) && styles.portChipActive
                          ]}
                          onPress={() => togglePortBinding(port)}
                        >
                          <Text style={[
                            styles.portChipText,
                            configData.portBinding.includes(port) && styles.portChipTextActive
                          ]}>
                            {port}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.sectionDivider}>
                    <Wifi color={Colors.primary} size={20} />
                    <Text style={styles.sectionTitle}>Konfigurasi WLAN</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>SSID *</Text>
                    <TextInput
                      style={styles.input}
                      value={configData.wlanSSID}
                      onChangeText={text => setConfigData({ ...configData, wlanSSID: text })}
                      placeholder="WiFi-Network"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Keamanan</Text>
                    <View style={styles.modeSelector}>
                      <TouchableOpacity
                        style={[styles.modeOption, configData.wlanSecurity === 'open' && styles.modeOptionActive]}
                        onPress={() => setConfigData({ ...configData, wlanSecurity: 'open' })}
                      >
                        <LockOpen color={configData.wlanSecurity === 'open' ? Colors.white : Colors.textSecondary} size={18} />
                        <Text style={[styles.modeOptionText, configData.wlanSecurity === 'open' && styles.modeOptionTextActive]}>
                          Open
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modeOption, configData.wlanSecurity === 'password' && styles.modeOptionActive]}
                        onPress={() => setConfigData({ ...configData, wlanSecurity: 'password' })}
                      >
                        <Lock color={configData.wlanSecurity === 'password' ? Colors.white : Colors.textSecondary} size={18} />
                        <Text style={[styles.modeOptionText, configData.wlanSecurity === 'password' && styles.modeOptionTextActive]}>
                          Password
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {configData.wlanSecurity === 'password' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password WiFi *</Text>
                      <TextInput
                        style={styles.input}
                        value={configData.wlanPassword}
                        onChangeText={text => setConfigData({ ...configData, wlanPassword: text })}
                        placeholder="Minimal 8 karakter"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                      />
                    </View>
                  )}

                  <TouchableOpacity style={styles.submitButton} onPress={handleSaveConfig}>
                    <Settings color={Colors.white} size={20} />
                    <Text style={styles.submitButtonText}>Simpan Konfigurasi</Text>
                  </TouchableOpacity>

                  {user?.role === 'super-admin' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteONU(selectedONU.id)}
                    >
                      <Trash2 color={Colors.white} size={20} />
                      <Text style={styles.deleteButtonText}>Hapus ONU</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
      {selectedONU && (
        <AiAnalysisModal
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          onuDistance={selectedONU.distance}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.offline,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  cardContent: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  modeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  filterModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  filterContent: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  applyButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  formContainer: {
    padding: 20,
  },
  onuInfoCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  onuInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  onuInfoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  modeOptionTextActive: {
    color: Colors.white,
  },
  portBindingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  portChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: Colors.online,
  },
  portChipText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  portChipTextActive: {
    color: '#059669',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteButton: {
    backgroundColor: Colors.offline,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  aiButton: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  aiButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
    emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
});
