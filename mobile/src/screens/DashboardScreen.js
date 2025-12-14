import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function DashboardScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const features = [
    {
      title: 'Symptom Checker',
      icon: 'medical',
      color: '#3b82f6',
      screen: 'Symptoms',
    },
    {
      title: 'MindWell Chat',
      icon: 'chatbubbles',
      color: '#8b5cf6',
      screen: 'MindWell',
    },
    {
      title: 'Imaging Hub',
      icon: 'image',
      color: '#ec4899',
      screen: 'Imaging',
    },
    {
      title: 'Profile',
      icon: 'person',
      color: '#10b981',
      screen: 'Profile',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Care-AI</Text>
        <Text style={styles.headerSubtitle}>Your Health Co-Pilot</Text>
      </View>

      {notifications.length > 0 && (
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Ionicons name="notifications" size={20} color="#10b981" />
            <Text style={styles.notificationTitle}>Notifications</Text>
          </View>
          {notifications.slice(0, 3).map((notif, index) => (
            <Text key={index} style={styles.notificationText}>
              • {notif.message}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.featureCard, { borderColor: feature.color }]}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <Ionicons name={feature.icon} size={32} color={feature.color} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Health Tip of the Day</Text>
        <Text style={styles.tipText}>
          Stay hydrated! Aim to drink at least 8 glasses of water daily to
          maintain optimal health and energy levels.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e3a8a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  notificationCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  featuresContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  tipCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
