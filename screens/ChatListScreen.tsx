import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Conversation } from '../types';
import chatData from '../data/chatData.json';

type ChatListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface ChatListProps {
  navigation: ChatListScreenNavigationProp;
}

const ChatListScreen: React.FC<ChatListProps> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setConversations(chatData.conversations);
      setLoading(false);
    }, 500);
  }, []);

  const handleUserPress = (userId: string, userName: string) => {
    navigation.navigate('Chat', { userId, userName });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const lastMessage = item.messages[item.messages.length - 1];

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleUserPress(item.userId, item.userName)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>{lastMessage.timestamp}</Text>
      </TouchableOpacity>
    );
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
        data={conversations}
        keyExtractor={(item) => item.userId}
        renderItem={renderConversationItem}
        scrollEnabled
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
});

export default ChatListScreen;
