import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Message, RootStackParamList } from '../types';
import chatData from '../data/chatData.json';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    // Set the header title
    navigation.setOptions({
      title: userName,
      headerShown: true,
    });

    // Load messages for this user
    const conversation = chatData.conversations.find(
      (c) => c.userId === userId
    );
    if (conversation) {
      setMessages(conversation.messages);
    }

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [userId, userName, navigation]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      sender: 'You',
      content: inputText,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');

    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessageItem = ({
    item,
  }: {
    item: Message;
  }): React.ReactElement => {
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
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={[
            styles.messageListContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 80 }
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

        <View style={[
          styles.inputContainer,
          {
            bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 0,
            position: 'absolute',
            left: 0,
            right: 0,
          }
        ]}>
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
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  messageListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 80, // Space for input container
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
