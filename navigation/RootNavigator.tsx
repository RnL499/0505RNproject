import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import type {
  RootStackParamList,
  BottomTabParamList,
} from '../types';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Bottom Tab Navigator - Contains ChatList and Profile tabs
 */
const ChatListNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-text-multiple-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: true,
          headerTitle: 'Messages',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: true,
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Stack Navigator - Contains tab navigator and chat screen
 * Note: NavigationContainer is provided by Expo Router, so we only return the Stack Navigator
 */
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#000',
        },
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={ChatListNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.userName,
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
