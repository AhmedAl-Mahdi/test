import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function MedicationScreen() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    schedule: '',
    inventory_count: '30',
    inventory_threshold: '5',
    reminder_minutes_before: '15',
    notes: '',
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medications');
      setMedications(response.data.medications || []);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      dosage: '',
      schedule: '',
      inventory_count: '30',
      inventory_threshold: '5',
      reminder_minutes_before: '15',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      inventory_count: String(med.inventory_count || 30),
      inventory_threshold: String(med.inventory_threshold || 5),
      reminder_minutes_before: String(med.reminder_minutes_before || 15),
      notes: med.notes || '',
    });
    setModalVisible(true);
  };

  const saveMedication = async () => {
    if (!formData.name || !formData.dosage || !formData.schedule) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        dosage: formData.dosage,
        schedule: formData.schedule,
        inventory_count: parseInt(formData.inventory_count) || 30,
        inventory_threshold: parseInt(formData.inventory_threshold) || 5,
        reminder_minutes_before: parseInt(formData.reminder_minutes_before) || 15,
        notes: formData.notes,
      };

      if (editingMed) {
        await api.put(`/medications/${editingMed.id}`, payload);
      } else {
        await api.post('/medications', payload);
      }

      setModalVisible(false);
      loadMedications();
      Alert.alert('Success', editingMed ? 'Medication updated' : 'Medication added');
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication');
    }
  };

  const deleteMedication = async (id) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/medications/${id}`);
              loadMedications();
              Alert.alert('Success', 'Medication deleted');
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const updateInventory = async (id, change) => {
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    const newCount = Math.max(0, med.inventory_count + change);
    
    try {
      await api.put(`/medications/${id}`, {
        ...med,
        inventory_count: newCount,
      });
      loadMedications();
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', 'Failed to update inventory');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Manager</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>No medications added yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first medication</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medHeader}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  <Text style={styles.medSchedule}>📅 {med.schedule}</Text>
                </View>
                <View style={styles.medActions}>
                  <TouchableOpacity onPress={() => openEditModal(med)}>
                    <Ionicons name="create-outline" size={24} color="#60a5fa" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteMedication(med.id)}>
                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inventorySection}>
                <Text style={styles.inventoryLabel}>Inventory</Text>
                <View style={styles.inventoryControls}>
                  <TouchableOpacity
                    style={styles.inventoryButton}
                    onPress={() => updateInventory(med.id, -1)}
                  >
                    <Ionicons name="remove" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.inventoryCount}>{med.inventory_count || 0}</Text>
                  <TouchableOpacity
                    style={styles.inventoryButton}
                    onPress={() => updateInventory(med.id, 1)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                {med.inventory_count <= med.inventory_threshold && (
                  <Text style={styles.lowStockWarning}>⚠️ Low stock</Text>
                )}
              </View>

              {med.notes && (
                <Text style={styles.medNotes}>💬 {med.notes}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMed ? 'Edit Medication' : 'Add Medication'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Aspirin"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Dosage *</Text>
              <TextInput
                style={styles.input}
                value={formData.dosage}
                onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                placeholder="e.g., 100mg"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Schedule *</Text>
              <TextInput
                style={styles.input}
                value={formData.schedule}
                onChangeText={(text) => setFormData({ ...formData, schedule: text })}
                placeholder="e.g., Twice daily"
                placeholderTextColor="#64748b"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Inventory Count</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.inventory_count}
                    onChangeText={(text) => setFormData({ ...formData, inventory_count: text })}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Low Stock Alert</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.inventory_threshold}
                    onChangeText={(text) => setFormData({ ...formData, inventory_threshold: text })}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Reminder (minutes before)</Text>
              <TextInput
                style={styles.input}
                value={formData.reminder_minutes_before}
                onChangeText={(text) => setFormData({ ...formData, reminder_minutes_before: text })}
                keyboardType="numeric"
                placeholder="15"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional information..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
                <Text style={styles.saveButtonText}>
                  {editingMed ? 'Update Medication' : 'Add Medication'}
                </Text>
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
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#cbd5e1',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  medCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 4,
  },
  medSchedule: {
    fontSize: 14,
    color: '#94a3b8',
  },
  medActions: {
    flexDirection: 'row',
    gap: 12,
  },
  inventorySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  inventoryLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  inventoryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inventoryButton: {
    backgroundColor: '#334155',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 50,
    textAlign: 'center',
  },
  lowStockWarning: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 8,
  },
  medNotes: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
