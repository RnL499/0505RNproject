import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import UserAvatar from '@/components/UserAvatar';
import { DesignSystem } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useFirestoreChat } from '@/hooks/useFirestoreChat';
import type { ChatMessage, ChatsStackParamList } from '@/types';
import { formatMessageTime } from '@/utils/chatUtils';

type ChatScreenProps = NativeStackScreenProps<ChatsStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { roomId, friendName, friendPhotoURL } = route.params;
  const { currentUser, markRoomAsRead, markRoomAsUnread, chatRooms } = useApp();
  const { messages, loading: chatLoading, error, sendMessage: sendFirestoreMessage } = useFirestoreChat(
    roomId,
    currentUser?.uid ?? '',
    currentUser?.name ?? '',
    currentUser?.photoURL ?? '',
  );
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: friendName });
    markRoomAsRead(roomId);
  }, [navigation, friendName, roomId, markRoomAsRead]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    await sendFirestoreMessage(inputText);
    setInputText('');
  };

  const handleMarkUnread = async () => {
    await markRoomAsUnread(roomId);
  };

  const room = chatRooms.find((r) => r.id === roomId);
  const friendUnread = room && currentUser ? room.unreadCount?.[room.friendUid] ?? 0 : 0;
  const canMarkUnread =
    room &&
    currentUser &&
    (room.unreadCount?.[currentUser.uid] ?? 0) === 0 &&
    room.lastMessageSenderId !== currentUser.uid &&
    messages.length > 0;
  const showReadReceipt =
    room &&
    currentUser &&
    room.lastMessageSenderId === currentUser.uid &&
    friendUnread === 0 &&
    messages.length > 0;

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === currentUser?.uid;

    const isLastMessage = messages[messages.length - 1]?.id === item.id;

    if (isOwn) {
      return (
        <View style={styles.messageRow}>
          <View style={styles.spacer} />
          <View style={styles.ownMessageContainer}>
            <View style={styles.ownMessage}>
              <Text style={styles.ownMessageText}>{item.content}</Text>
            </View>
            <View style={styles.messageMetaRow}>
              <Text style={styles.messageTime}>{formatMessageTime(item.createdAt)}</Text>
              {isLastMessage && showReadReceipt ? (
                <Text style={styles.readReceipt}>已讀</Text>
              ) : null}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRow}>
        <UserAvatar
          name={item.senderName}
          photoURL={item.senderPhotoURL || friendPhotoURL}
          size={32}
          style={styles.otherAvatar}
        />
        <View style={styles.otherMessageContainer}>
          <View style={styles.otherMessage}>
            <Text style={styles.otherMessageText}>{item.content}</Text>
          </View>
          <Text style={styles.messageTime}>{formatMessageTime(item.createdAt)}</Text>
        </View>
        <View style={styles.spacer} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={[
            styles.messageListContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 80 },
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>尚無訊息，傳第一則訊息吧！</Text>
          }
          onContentSizeChange={() => {
            if (keyboardHeight === 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {canMarkUnread ? (
          <View style={styles.unreadBar}>
            <Text style={styles.unreadText}>此對話目前已標記為已讀</Text>
            <TouchableOpacity style={styles.markUnreadButton} onPress={handleMarkUnread}>
              <Text style={styles.markUnreadButtonText}>標記為未讀</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={[
            styles.inputContainer,
            {
              bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 0,
              position: 'absolute',
              left: 0,
              right: 0,
            },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="輸入訊息..."
            placeholderTextColor="#bbb"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>送出</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.tertiary,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  messageListContent: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: DesignSystem.colors.text.tertiary,
    marginTop: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: DesignSystem.spacing.xs,
    alignItems: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  otherAvatar: {
    marginRight: DesignSystem.spacing.sm,
    marginBottom: 18,
  },
  ownMessageContainer: {
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  ownMessage: {
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  ownMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  otherMessageContainer: {
    maxWidth: '75%',
    alignItems: 'flex-start',
  },
  otherMessage: {
    backgroundColor: DesignSystem.colors.primaryLight,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.medium,
  },
  otherMessageText: {
    color: DesignSystem.colors.text.primary,
    fontSize: 16,
  },
  messageMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: DesignSystem.spacing.xs,
  },
  messageTime: {
    fontSize: 11,
    color: DesignSystem.colors.text.tertiary,
  },
  readReceipt: {
    fontSize: 11,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
    marginLeft: DesignSystem.spacing.sm,
  },
  unreadBar: {
    backgroundColor: DesignSystem.colors.primaryLight,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.border.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 13,
  },
  markUnreadButton: {
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.round,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  markUnreadButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.sm,
    alignItems: 'flex-end',
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.border.light,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.medium,
    borderRadius: DesignSystem.borderRadius.round,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
    backgroundColor: DesignSystem.colors.background.secondary,
    color: DesignSystem.colors.text.primary,
  },
  sendButton: {
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.round,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DesignSystem.spacing.md,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
