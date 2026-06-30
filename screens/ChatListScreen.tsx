import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import UserAvatar from '@/components/UserAvatar';
import { DesignSystem } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import type { ChatsStackParamList } from '@/types';
import { formatMessageTime } from '@/utils/chatUtils';

type NavProp = NativeStackNavigationProp<ChatsStackParamList, 'ChatList'>;

interface Props {
  navigation: NavProp;
}

const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const { friends, chatRooms, currentUser } = useApp();
  const [searchText, setSearchText] = useState('');

  const filteredChats = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return chatRooms;
    return chatRooms.filter(
      (room) =>
        room.friendName.toLowerCase().includes(query) ||
        room.lastMessage.toLowerCase().includes(query),
    );
  }, [chatRooms, searchText]);

  const handleRoomPress = (roomId: string, friendId: string, friendName: string, friendPhotoURL: string) => {
    navigation.navigate('Chat', { roomId, friendId, friendName, friendPhotoURL });
  };

  const handleFriendPress = (friendId: string, friendName: string, friendPhotoURL: string) => {
    const room = chatRooms.find((r) => r.friendUid === friendId);
    if (room) {
      handleRoomPress(room.id, friendId, friendName, friendPhotoURL);
    }
  };

  const unreadCount = (roomId: string) => {
    if (!currentUser) return 0;
    const room = chatRooms.find((r) => r.id === roomId);
    return room?.unreadCount?.[currentUser.uid] ?? 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜尋聊天或好友"
          placeholderTextColor="#8e8e93"
          style={styles.searchInput}
        />
      </View>

      {friends.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>好友</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendList}>
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.uid}
                style={styles.friendItem}
                activeOpacity={0.8}
                onPress={() => handleFriendPress(friend.uid, friend.name, friend.photoURL)}
              >
                <UserAvatar name={friend.name} photoURL={friend.photoURL} size={58} />
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        contentContainerStyle={filteredChats.length === 0 ? styles.emptyList : styles.chatListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {friends.length === 0
              ? '尚無聊天室，請先到 Friends 分頁加好友'
              : '尚無聊天紀錄，點選好友開始聊天'}
          </Text>
        }
        renderItem={({ item }) => {
          const unread = unreadCount(item.id);
          const friendUnread = currentUser ? item.unreadCount?.[item.friendUid] ?? 0 : 0;
          const myUnread = currentUser ? item.unreadCount?.[currentUser.uid] ?? 0 : 0;
          const readStatus = item.lastMessageSenderId === currentUser?.uid
            ? friendUnread === 0
              ? '已讀'
              : '未讀'
            : myUnread > 0
            ? `${myUnread} 則未讀`
            : '已讀';
          const isUnread = unread > 0;

          return (
            <TouchableOpacity
              style={[styles.conversationItem, isUnread && styles.conversationItemUnread]}
              onPress={() =>
                handleRoomPress(item.id, item.friendUid, item.friendName, item.friendPhotoURL)
              }
              activeOpacity={0.8}
            >
              <UserAvatar
                name={item.friendName}
                photoURL={item.friendPhotoURL}
                size={52}
                style={styles.avatarMargin}
              />
              <View style={styles.conversationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.isFriend ? item.friendName : '陌生人'}
                  </Text>
                  <Text style={[styles.statusLabel, isUnread && styles.statusLabelUnread]}>
                    {readStatus}
                  </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || (item.isFriend ? '開始聊天吧' : '陌生訊息')}
                </Text>
              </View>
              <View style={styles.metaColumn}>
                {item.lastMessageTime ? (
                  <Text style={styles.timestamp}>{formatMessageTime(item.lastMessageTime)}</Text>
                ) : null}
                {unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  searchSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.tertiary,
  },
  searchInput: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.xl,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    fontSize: 15,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
    color: DesignSystem.colors.text.primary,
  },
  sectionBlock: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  friendList: {
    paddingRight: DesignSystem.spacing.sm,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: DesignSystem.spacing.lg,
    width: 62,
  },
  friendName: {
    marginTop: DesignSystem.spacing.sm,
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  chatList: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  chatListContent: {
    paddingBottom: DesignSystem.spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  conversationItemUnread: {
    backgroundColor: DesignSystem.colors.primaryExtraLight,
  },
  avatarMargin: {
    marginRight: DesignSystem.spacing.md,
  },
  conversationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    color: DesignSystem.colors.text.tertiary,
  },
  statusLabelUnread: {
    color: DesignSystem.colors.primary,
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
  },
  metaColumn: {
    alignItems: 'flex-end',
    marginLeft: DesignSystem.spacing.sm,
    minWidth: 48,
  },
  timestamp: {
    fontSize: 12,
    color: DesignSystem.colors.text.tertiary,
  },
  badge: {
    marginTop: DesignSystem.spacing.xs,
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.round,
    minWidth: 20,
    height: 20,
    paddingHorizontal: DesignSystem.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    padding: DesignSystem.spacing.lg,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ChatListScreen;
