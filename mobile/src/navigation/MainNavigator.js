import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import SymptomsScreen from '../screens/SymptomsScreen';
import MindWellScreen from '../screens/MindWellScreen';
import ImagingScreen from '../screens/ImagingScreen';
import MedicationScreen from '../screens/MedicationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Symptoms') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'MindWell') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Imaging') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'Medications') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
        },
        headerStyle: {
          backgroundColor: '#1e3a8a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Symptoms" component={SymptomsScreen} />
      <Tab.Screen name="MindWell" component={MindWellScreen} />
      <Tab.Screen name="Imaging" component={ImagingScreen} />
      <Tab.Screen name="Medications" component={MedicationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
