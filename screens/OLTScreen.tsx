import React, { useState, useMemo } from 'react';
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
import { addOLT, updateOLT, deleteOLT, OLT } from '../store/oltSlice';
import { Plus, Server, MapPin, Activity, X, Trash2, Edit } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useFocusEffect } from 'expo-router';

export default function OLTScreen() {
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Colors.card);
      }
    }, [])
  );

  const dispatch = useDispatch();
  const allOlts = useSelector((state: RootState) => state.olt.olts);
  const { user } = useSelector((state: RootState) => state.auth);

  const olts = useMemo(() => {
    if (user?.role === 'teknisi' && user.location) {
      return allOlts.filter(olt => olt.location === user.location);
    }
    return allOlts;
  }, [user, allOlts]);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOLT, setSelectedOLT] = useState<OLT | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ipAddress: '',
    snmpPort: '161',
    snmpVersion: 'v2c',
    snmpCommunity: 'public',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      ipAddress: '',
      snmpPort: '161',
      snmpVersion: 'v2c',
      snmpCommunity: 'public',
    });
    setIsEditing(false);
    setSelectedOLT(null);
  };

  const handleAddOLT = () => {
    if (!formData.name || !formData.location || !formData.ipAddress) {
      Alert.alert('Error', 'Silakan lengkapi semua field yang diperlukan');
      return;
    }

    const newOLT: OLT = {
      id: Date.now().toString(),
      name: formData.name,
      location: formData.location,
      ipAddress: formData.ipAddress,
      snmpPort: parseInt(formData.snmpPort),
      snmpVersion: formData.snmpVersion,
      snmpCommunity: formData.snmpCommunity,
      status: 'online',
      uptime: '0 hari 0 jam',
      totalPorts: 16,
      activePorts: 0,
      createdAt: new Date().toISOString(),
    };

    if (isEditing && selectedOLT) {
      dispatch(updateOLT({ ...newOLT, id: selectedOLT.id }));
    } else {
      dispatch(addOLT(newOLT));
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEditOLT = (olt: OLT) => {
    setSelectedOLT(olt);
    setFormData({
      name: olt.name,
      location: olt.location,
      ipAddress: olt.ipAddress,
      snmpPort: olt.snmpPort.toString(),
      snmpVersion: olt.snmpVersion,
      snmpCommunity: olt.snmpCommunity,
    });
    setIsEditing(true);
    setDetailModalVisible(false);
    setModalVisible(true);
  };

  const handleDeleteOLT = (id: string) => {
    Alert.alert(
      'Hapus OLT',
      'Apakah Anda yakin ingin menghapus OLT ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteOLT(id));
            setDetailModalVisible(false);
          },
        },
      ]
    );
  };

  const renderOLTCard = ({ item }: { item: OLT }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedOLT(item);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Server color={Colors.primary} size={24} />
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'online' ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'online' ? '#166534' : '#991b1b' }]}>
            {item.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MapPin color={Colors.textSecondary} size={16} />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Activity color={Colors.textSecondary} size={16} />
          <Text style={styles.infoText}>{item.ipAddress}:{item.snmpPort}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{item.activePorts}/{item.totalPorts}</Text>
          <Text style={styles.statLabel}>Port Aktif</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{item.uptime}</Text>
          <Text style={styles.statLabel}>Uptime</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={olts}
        renderItem={renderOLTCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada OLT di lokasi tugas Anda.</Text>}
      />

      {user?.role === 'super-admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Plus color={Colors.white} size={28} />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit OLT' : 'Tambah OLT Baru'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama OLT *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={text => setFormData({ ...formData, name: text })}
                  placeholder="Contoh: OLT-Central-01"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lokasi *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={text => setFormData({ ...formData, location: text })}
                  placeholder="Contoh: Gedung Pusat"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IP Address *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ipAddress}
                  onChangeText={text => setFormData({ ...formData, ipAddress: text })}
                  placeholder="192.168.1.100"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SNMP Port</Text>
                <TextInput
                  style={styles.input}
                  value={formData.snmpPort}
                  onChangeText={text => setFormData({ ...formData, snmpPort: text })}
                  placeholder="161"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SNMP Version</Text>
                <TextInput
                  style={styles.input}
                  value={formData.snmpVersion}
                  onChangeText={text => setFormData({ ...formData, snmpVersion: text })}
                  placeholder="v2c"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SNMP Community</Text>
                <TextInput
                  style={styles.input}
                  value={formData.snmpCommunity}
                  onChangeText={text => setFormData({ ...formData, snmpCommunity: text })}
                  placeholder="public"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddOLT}>
                <Text style={styles.submitButtonText}>{isEditing ? 'Update OLT' : 'Tambah OLT'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOLT && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail OLT</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <X color={Colors.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailTitle}>{selectedOLT.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: selectedOLT.status === 'online' ? '#dcfce7' : '#fee2e2', alignSelf: 'flex-start', marginTop: 8 }]}>
                      <Text style={[styles.statusText, { color: selectedOLT.status === 'online' ? '#166534' : '#991b1b' }]}>
                        {selectedOLT.status === 'online' ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Informasi Lokasi</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Lokasi</Text>
                      <Text style={styles.detailValue}>{selectedOLT.location}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Konfigurasi SNMP</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>IP Address</Text>
                      <Text style={styles.detailValue}>{selectedOLT.ipAddress}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Port</Text>
                      <Text style={styles.detailValue}>{selectedOLT.snmpPort}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>SNMP Version</Text>
                      <Text style={styles.detailValue}>{selectedOLT.snmpVersion}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Community</Text>
                      <Text style={styles.detailValue}>{selectedOLT.snmpCommunity}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Statistik</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Port</Text>
                      <Text style={styles.detailValue}>{selectedOLT.totalPorts}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Port Aktif</Text>
                      <Text style={styles.detailValue}>{selectedOLT.activePorts}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Uptime</Text>
                      <Text style={styles.detailValue}>{selectedOLT.uptime}</Text>
                    </View>
                  </View>

                  {user?.role === 'super-admin' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditOLT(selectedOLT)}
                      >
                        <Edit color={Colors.white} size={20} />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteOLT(selectedOLT.id)}
                      >
                        <Trash2 color={Colors.white} size={20} />
                        <Text style={styles.deleteButtonText}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  cardContent: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  formContainer: {
    padding: 20,
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
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  detailContainer: {
    padding: 20,
  },
  detailCard: {
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  detailSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.offline,
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
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
