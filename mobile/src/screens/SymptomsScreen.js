import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../config/api';

export default function SymptomsScreen() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms || !age || !gender) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/symptoms/analyze', {
        symptoms,
        age: parseInt(age),
        gender,
        duration,
        severity,
      });
      setResult(response.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Symptom Checker</Text>
        <Text style={styles.subtitle}>
          Describe your symptoms and get AI-powered insights
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Symptoms *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your symptoms..."
            placeholderTextColor="#94a3b8"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="#94a3b8"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Other'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  gender === option && styles.genderButtonActive,
                ]}
                onPress={() => setGender(option)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === option && styles.genderButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Duration (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2 days, 1 week"
            placeholderTextColor="#94a3b8"
            value={duration}
            onChangeText={setDuration}
          />

          <Text style={styles.label}>Severity (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., mild, moderate, severe"
            placeholderTextColor="#94a3b8"
            value={severity}
            onChangeText={setSeverity}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Analyze Symptoms</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Result</Text>
            <Text style={styles.resultText}>{result.analysis}</Text>
            
            {result.recommendations && (
              <>
                <Text style={styles.resultSubtitle}>Recommendations</Text>
                <Text style={styles.resultText}>{result.recommendations}</Text>
              </>
            )}
            
            <Text style={styles.disclaimer}>
              ⚠️ This is AI-generated information for educational purposes only.
              Please consult a healthcare professional for medical advice.
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
  form: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#10b981',
  },
  genderButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
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
  resultSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
