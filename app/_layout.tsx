import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { BrandColors } from '@/constants/theme';
import { AppProvider, useApp } from '@/contexts/AppContext';
import AuthScreen from '@/screens/AuthScreen';
import ChatListScreen from '@/screens/ChatListScreen';
import ChatScreen from '@/screens/ChatScreen';
import FindFriendsScreen from '@/screens/FindFriendsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import type { BottomTabParamList, ChatsStackParamList, RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
const ChatsStack = createNativeStackNavigator<ChatsStackParamList>();

const ChatsStackNavigator: React.FC = () => {
  return (
    <ChatsStack.Navigator>
      <ChatsStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: '聊天' }}
      />
      <ChatsStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.friendName,
          headerBackTitle: '返回',
        })}
      />
    </ChatsStack.Navigator>
  );
};

const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: BrandColors.standard,
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Friends"
        component={FindFriendsScreen}
        options={{
          title: '好友',
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStackNavigator}
        options={{
          title: '聊天',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '設定',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

function AppNavigation() {
  const { loading, currentUser } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={BrandColors.standard} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigation />
      </NavigationContainer>
      <StatusBar style="auto" />
    </AppProvider>
  );
}
