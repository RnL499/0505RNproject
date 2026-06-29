import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
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
  lastMessage: string;
  lastMessageTime: string;
  friendId: string;
  friendName: string;
  avatarColor: string;
}

interface FriendItem {
  id: string;
  name: string;
  avatarColor: string;
  status: string;
}

interface GroupItem {
  id: string;
  name: string;
  memberCount: number;
  avatarColor: string;
}

const friendsData: FriendItem[] = [
  { id: 'f1', name: 'Ava', avatarColor: '#FF6B6B', status: 'Online' },
  { id: 'f2', name: 'Noah', avatarColor: '#4ECDC4', status: 'Away' },
  { id: 'f3', name: 'Mia', avatarColor: '#45B7D1', status: 'Online' },
  { id: 'f4', name: 'Liam', avatarColor: '#F7B267', status: 'Busy' },
  { id: 'f5', name: 'Sophia', avatarColor: '#9B5DE5', status: 'Online' },
];

const groupsData: GroupItem[] = [
  { id: 'g1', name: 'Work Team', memberCount: 6, avatarColor: '#16A085' },
  { id: 'g2', name: 'Travel Club', memberCount: 8, avatarColor: '#2980B9' },
];

const chatRoomsData: ChatRoomItem[] = [
  {
    id: 'room1',
    lastMessage: 'Hey! Are you free later?',
    lastMessageTime: '2026-06-29T10:30:00.000Z',
    friendId: 'u1',
    friendName: 'Ava',
    avatarColor: '#FF6B6B',
  },
  {
    id: 'room2',
    lastMessage: 'I sent the files over.',
    lastMessageTime: '2026-06-29T09:15:00.000Z',
    friendId: 'u2',
    friendName: 'Noah',
    avatarColor: '#4ECDC4',
  },
  {
    id: 'room3',
    lastMessage: 'Let me know what you think.',
    lastMessageTime: '2026-06-28T20:05:00.000Z',
    friendId: 'u3',
    friendName: 'Mia',
    avatarColor: '#45B7D1',
  },
  {
    id: 'room4',
    lastMessage: 'See you at the cafe tomorrow.',
    lastMessageTime: '2026-06-28T18:20:00.000Z',
    friendId: 'u4',
    friendName: 'Liam',
    avatarColor: '#F7B267',
  },
  {
    id: 'room5',
    lastMessage: 'The meeting notes are ready.',
    lastMessageTime: '2026-06-27T16:40:00.000Z',
    friendId: 'u5',
    friendName: 'Sophia',
    avatarColor: '#9B5DE5',
  },
];

const ChatListScreen: React.FC<ChatListProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const filteredChats = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return chatRoomsData;
    }

    return chatRoomsData.filter((chat) => {
      return (
        chat.friendName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
      );
    });
  }, [searchText]);

  const handleRoomPress = (friendId: string, friendName: string) => {
    navigation.navigate('Chat', { userId: friendId, userName: friendName });
  };

  const formatTime = (value: string) => {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search chats or friends"
          placeholderTextColor="#8e8e93"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <FlatList
          data={friendsData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.friendItem} activeOpacity={0.8}>
              <View style={[styles.friendAvatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.friendAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.friendName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Groups</Text>
        <FlatList
          data={groupsData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendList}
          renderItem={({ item }) => (
            <View style={styles.groupCard}>
              <View style={[styles.groupAvatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.friendAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupMeta}>{item.memberCount} members</Text>
            </View>
          )}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats matched your search.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleRoomPress(item.friendId, item.friendName)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  friendList: {
    paddingRight: 8,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 14,
    width: 62,
  },
  friendAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  friendName: {
    marginTop: 6,
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  groupCard: {
    width: 110,
    padding: 10,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  groupMeta: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
  },
  chatList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatListContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8e8e93',
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e93',
    marginLeft: 8,
  },
  emptyText: {
    padding: 20,
    color: '#8e8e93',
    textAlign: 'center',
  },
});

export default ChatListScreen;
