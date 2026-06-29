import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import type { RootStackParamList } from '../types';

type ChatListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface ChatListProps {
  navigation: ChatListScreenNavigationProp;
}

interface ChatRoomItem {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageTime: string;
  friendId: string;
  friendName: string;
}

const ChatListScreen: React.FC<ChatListProps> = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoRooms: ChatRoomItem[] = [
      {
        id: 'room1',
        participantIds: ['me', 'u1'],
        lastMessage: 'Hey! Are you free later?',
        lastMessageTime: '2026-06-29T10:30:00.000Z',
        friendId: 'u1',
        friendName: 'Ava',
      },
      {
        id: 'room2',
        participantIds: ['me', 'u2'],
        lastMessage: 'I sent the files over.',
        lastMessageTime: '2026-06-29T09:15:00.000Z',
        friendId: 'u2',
        friendName: 'Noah',
      },
    ];

    const timeout = setTimeout(() => {
      setChatRooms(demoRooms);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  const handleRoomPress = (friendId: string, friendName: string) => {
    navigation.navigate('Chat', { userId: friendId, userName: friendName });
  };

  const formatTime = (value: string) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleRoomPress(item.friendId, item.friendName)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.friendName.charAt(0).toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.conversationContent}>
              <Text style={styles.userName}>{item.friendName}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.timestamp}>{formatTime(item.lastMessageTime)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No active chats yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  emptyText: {
    padding: 16,
    color: '#777',
  },
});

export default ChatListScreen;
