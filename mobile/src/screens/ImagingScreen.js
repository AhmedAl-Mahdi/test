import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';

export default function ImagingScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanType, setScanType] = useState('pneumonia');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const scanTypes = [
    { id: 'pneumonia', name: 'Pneumonia', color: '#3b82f6' },
    { id: 'breast_cancer', name: 'Breast Cancer', color: '#ec4899' },
    { id: 'kidney_disease', name: 'Kidney Disease', color: '#f59e0b' },
    { id: 'brain_tumor', name: 'Brain Tumor', color: '#8b5cf6' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'scan.jpg',
      });
      formData.append('scan_type', scanType);

      const response = await api.post('/imaging/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Diagnostic Imaging</Text>
        <Text style={styles.subtitle}>
          Upload a medical scan for AI-powered analysis
        </Text>

        <View style={styles.scanTypeContainer}>
          <Text style={styles.label}>Select Scan Type</Text>
          <View style={styles.scanTypeGrid}>
            {scanTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.scanTypeButton,
                  scanType === type.id && {
                    backgroundColor: type.color,
                    borderColor: type.color,
                  },
                ]}
                onPress={() => setScanType(type.id)}
              >
                <Text
                  style={[
                    styles.scanTypeText,
                    scanType === type.id && styles.scanTypeTextActive,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.imageSection}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedImage}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, !selectedImage && styles.buttonDisabled]}
          onPress={analyzeImage}
          disabled={!selectedImage || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Scan</Text>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Result</Text>
            <Text style={styles.resultLabel}>Prediction:</Text>
            <Text style={styles.resultText}>{result.prediction}</Text>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text style={styles.resultText}>
              {(result.confidence * 100).toFixed(1)}%
            </Text>
            <Text style={styles.disclaimer}>
              ⚠️ This is AI-generated analysis for educational purposes only.
              Always consult a healthcare professional for diagnosis.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  scanTypeContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scanTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scanTypeButton: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  scanTypeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  scanTypeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 20,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#1e293b',
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
