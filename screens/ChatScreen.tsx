import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

import type { Message, RootStackParamList } from '../types';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const demoMessages: Message[] = [
  {
    id: 'm1',
    sender: 'Ava',
    content: 'Hey! Are you free later?',
    timestamp: '10:30',
    isOwn: false,
  },
  {
    id: 'm2',
    sender: 'You',
    content: 'Yes, I am.',
    timestamp: '10:31',
    isOwn: true,
  },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    navigation.setOptions({
      title: userName,
      headerShown: true,
    });

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    const timeout = setTimeout(() => {
      setMessages(demoMessages);
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }, 300);

    return () => {
      clearTimeout(timeout);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [navigation, userId, userName]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `${Date.now()}`,
      sender: 'You',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const renderMessageItem = ({ item }: { item: Message }): React.ReactElement => {
    if (item.isOwn) {
      return (
        <View style={styles.messageRow}>
          <View style={styles.spacer} />
          <View style={styles.ownMessageContainer}>
            <View style={styles.ownMessage}>
              <Text style={styles.ownMessageText}>{item.content}</Text>
            </View>
            <Text style={styles.messageTime}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRow}>
        <View style={styles.otherMessageContainer}>
          <View style={styles.otherMessage}>
            <Text style={styles.otherMessageText}>{item.content}</Text>
          </View>
          <Text style={styles.messageTime}>{item.timestamp}</Text>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={[
              styles.messageListContent,
              { paddingBottom: keyboardHeight > 0 ? 20 : 80 },
            ]}
            onContentSizeChange={() => {
              if (keyboardHeight === 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
        )}

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
            placeholder="Type a message..."
            placeholderTextColor="#bbb"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  ownMessageContainer: {
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  ownMessage: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  otherMessageText: {
    color: '#000',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
