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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addUser, User } from '../store/authSlice';
import { Plus, User as UserIcon, MapPin, ChevronDown, X, Briefcase } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

export default function UserManagementScreen() {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.auth);
  const { olts } = useSelector((state: RootState) => state.olt);
  const [modalVisible, setModalVisible] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const uniqueLocations = useMemo(() => [...new Set(olts.map(olt => olt.location))], [olts]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    position: '',
    location: '',
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      position: '',
      location: '',
    });
  };

  const handleAddUser = () => {
    if (!formData.username || !formData.password || !formData.name || !formData.position || !formData.location) {
      Alert.alert('Error', 'Silakan lengkapi semua field.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: formData.username,
      password: formData.password,
      name: formData.name,
      position: formData.position,
      role: 'teknisi',
      location: formData.location,
    };

    dispatch(addUser(newUser));
    setModalVisible(false);
    resetForm();
    Alert.alert('Sukses', `Pengguna teknisi ${formData.name} berhasil ditambahkan.`);
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserIcon color={Colors.primary} size={24} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.position}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'super-admin' ? '#dcfce7' : '#e0e7ff' }]}>
          <Text style={[styles.roleText, { color: item.role === 'super-admin' ? '#166534' : '#4338ca' }]}>
            {item.role === 'super-admin' ? 'Super Admin' : 'Teknisi'}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <MapPin color={Colors.textSecondary} size={16} />
        <Text style={styles.infoText}>Lokasi Tugas: {item.location || 'Semua Lokasi'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
        <Plus color={Colors.white} size={28} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Teknisi Baru</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={text => setFormData({ ...formData, name: text })}
                  placeholder="Contoh: Budi Santoso"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jabatan *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.position}
                  onChangeText={text => setFormData({ ...formData, position: text })}
                  placeholder="Contoh: Teknisi Lapangan"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={text => setFormData({ ...formData, username: text })}
                  placeholder="Username untuk login"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={text => setFormData({ ...formData, password: text })}
                  placeholder="Minimal 8 karakter"
                  secureTextEntry
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lokasi Tugas *</Text>
                 <TouchableOpacity style={styles.pickerButton} onPress={() => setShowLocationPicker(!showLocationPicker)}>
                    <MapPin color={Colors.textSecondary} size={20} />
                    <Text style={styles.pickerButtonText}>{formData.location || 'Pilih Lokasi'}</Text>
                    <ChevronDown color={Colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  {showLocationPicker && (
                    <View style={styles.pickerOptionsContainer}>
                      {uniqueLocations.map((loc, index) => (
                        <TouchableOpacity
                          key={loc}
                          style={[styles.pickerOption, index === uniqueLocations.length - 1 && { borderBottomWidth: 0 }]}
                          onPress={() => {
                            setFormData({...formData, location: loc});
                            setShowLocationPicker(false);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, formData.location === loc && styles.pickerOptionTextActive]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddUser}>
                <Text style={styles.submitButtonText}>Tambah Teknisi</Text>
              </TouchableOpacity>
            </ScrollView>
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
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoText: {
    fontSize: 14,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
});
