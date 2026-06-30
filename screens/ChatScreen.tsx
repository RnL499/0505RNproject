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
import { BrandColors } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import type { ChatMessage, ChatsStackParamList } from '@/types';
import { formatMessageTime } from '@/utils/chatUtils';

type ChatScreenProps = NativeStackScreenProps<ChatsStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { roomId, friendName, friendPhotoURL } = route.params;
  const { currentUser, getMessages, sendMessage, markRoomAsRead, markRoomAsUnread, chatRooms } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: friendName });
    markRoomAsRead(roomId);
  }, [navigation, friendName, roomId, markRoomAsRead]);

  useEffect(() => {
    setMessages(getMessages(roomId));
  }, [getMessages, roomId, chatRooms]);

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
    await sendMessage(roomId, inputText);
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
    backgroundColor: '#f4efff',
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  messageListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  otherAvatar: {
    marginRight: 8,
    marginBottom: 18,
  },
  ownMessageContainer: {
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  ownMessage: {
    backgroundColor: BrandColors.standard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    backgroundColor: '#f7f4ff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ede6ff',
  },
  otherMessageText: {
    color: '#1c1c1c',
    fontSize: 16,
  },
  messageMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  readReceipt: {
    fontSize: 11,
    color: BrandColors.standard,
    fontWeight: '700',
  },
  unreadBar: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e7d7ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadText: {
    color: '#6d5b93',
    fontSize: 13,
  },
  markUnreadButton: {
    backgroundColor: BrandColors.standard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  markUnreadButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b9a7e7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: BrandColors.standard,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
