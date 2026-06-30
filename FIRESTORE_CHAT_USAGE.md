/**
 * Firestore 聊天集成示例
 * 
 * 在 ChatScreen.tsx 或聊天相關組件中的使用方式
 */

import { useFirestoreChat } from '@/hooks/useFirestoreChat';

/**
 * 在組件內使用 Firestore 聊天 Hook
 */
const useChatScreenExample = () => {
  const chatRoomId = 'matching-room-id';
  const currentUserId = 'current-user-uid';
  const currentUserName = '使用者名稱';
  const currentUserPhotoURL = 'https://...';

  // 使用 Hook 取得訊息與發送函數
  const { messages, loading, error, sendMessage } = useFirestoreChat(
    chatRoomId,
    currentUserId,
    currentUserName,
    currentUserPhotoURL,
  );

  /**
   * 發送訊息的處理函數
   */
  const handleSendMessage = async (messageText: string) => {
    try {
      await sendMessage(messageText);
      // 訊息已發送，messages 會透過監聽自動更新
    } catch (err) {
      const message = err instanceof Error ? err.message : '發送失敗';
      console.error('發送訊息錯誤:', message);
      // 可以在這裡顯示 Toast 或 Alert
    }
  };

  return {
    messages,
    loading,
    error,
    handleSendMessage,
  };
};

/**
 * 完整的 Chat Screen 整合範例
 * 
 * 替換現有的 ChatScreen.tsx 中的訊息邏輯即可使用
 * 
 * const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
 *   const { roomId, friendId, friendName, friendPhotoURL } = route.params;
 *   const { currentUser } = useAuth(); // 從 AuthContext 取得當前使用者
 *   
 *   const { messages, loading, error, sendMessage: sendFirestoreMessage } = useFirestoreChat(
 *     roomId,
 *     currentUser?.uid || '',
 *     currentUser?.displayName || 'Anonymous',
 *     currentUser?.photoURL || '',
 *   );
 *   
 *   const handleSendMessage = async (text: string) => {
 *     try {
 *       await sendFirestoreMessage(text);
 *       setInputText('');
 *     } catch (err) {
 *       Alert.alert('錯誤', '無法發送訊息');
 *     }
 *   };
 *   
 *   if (loading) {
 *     return (
 *       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 *         <ActivityIndicator />
 *       </View>
 *     );
 *   }
 *   
 *   return (
 *     <View style={{ flex: 1 }}>
 *       <FlatList
 *         data={messages}
 *         keyExtractor={(item) => item.id}
 *         renderItem={({ item }) => (
 *           <View>
 *             <Text>{item.text}</Text>
 *             <Text>{item.senderName}</Text>
 *             <Text>{item.createdAt?.toDate().toLocaleString()}</Text>
 *           </View>
 *         )}
 *       />
 *       <TextInput
 *         placeholder="輸入訊息..."
 *         onChangeText={setInputText}
 *         value={inputText}
 *       />
 *       <TouchableOpacity onPress={() => handleSendMessage(inputText)}>
 *         <Text>發送</Text>
 *       </TouchableOpacity>
 *     </View>
 *   );
 * };
 */

export const FirestoreChatExample = {
  useChatScreenExample,
};
