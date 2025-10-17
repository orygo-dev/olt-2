import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BrainCircuit, X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { MotiView } from 'moti';

interface AiAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  onuDistance: string;
}

export default function AiAnalysisModal({ visible, onClose, onuDistance }: AiAnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setResult('');
      const timer = setTimeout(() => {
        const distanceNum = parseFloat(onuDistance.replace(' km', ''));
        const breakPoint = (Math.random() * (distanceNum * 0.9)).toFixed(2);
        setResult(`Analisis AI memperkirakan kabel fiber optik putus pada jarak sekitar ${breakPoint} km dari OLT.`);
        setLoading(false);
      }, 2500); // Simulate AI analysis time

      return () => clearTimeout(timer);
    }
  }, [visible, onuDistance]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing' }}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Analisis AI</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <BrainCircuit color={Colors.primary} size={48} />
            {loading ? (
              <>
                <Text style={styles.statusText}>Menganalisis data sinyal terakhir...</Text>
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
              </>
            ) : (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Text style={styles.resultTitle}>Hasil Analisis:</Text>
                <Text style={styles.resultText}>{result}</Text>
              </MotiView>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: '100%',
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 150,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
