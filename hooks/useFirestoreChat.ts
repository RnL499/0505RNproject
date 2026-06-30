import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '../api/firebaseConfig';

export interface FirestoreChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  createdAt: Timestamp | null;
}

/**
 * Firestore 聊天邏輯 Hook
 * 提供半即時訊息發送和接收功能
 */
export const useFirestoreChat = (chatRoomId: string, currentUserId: string, currentUserName: string, currentUserPhotoURL: string) => {
  const [messages, setMessages] = useState<FirestoreChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 發送訊息
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !chatRoomId || !currentUserId) {
        throw new Error('缺少必要的訊息或使用者資訊');
      }

      try {
        await addDoc(
          collection(db, 'chatRooms', chatRoomId, 'messages'),
          {
            text: text.trim(),
            senderId: currentUserId,
            senderName: currentUserName,
            senderPhotoURL: currentUserPhotoURL,
            createdAt: serverTimestamp(),
          },
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '發送訊息失敗';
        setError(message);
        throw new Error(message);
      }
    },
    [chatRoomId, currentUserId, currentUserName, currentUserPhotoURL],
  );

  /**
   * 監聽訊息（半即時更新）
   */
  useEffect(() => {
    if (!chatRoomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'chatRooms', chatRoomId, 'messages'),
        orderBy('createdAt', 'asc'),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messagesData: FirestoreChatMessage[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            text: doc.data().text || '',
            senderId: doc.data().senderId || '',
            senderName: doc.data().senderName || '未知使用者',
            senderPhotoURL: doc.data().senderPhotoURL || '',
            createdAt: doc.data().createdAt as Timestamp | null,
          }));

          setMessages(messagesData);
          setLoading(false);
        },
        (err) => {
          const message = err instanceof Error ? err.message : '監聽訊息失敗';
          setError(message);
          setLoading(false);
          console.error('Firestore 監聽錯誤:', message);
        },
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '設定監聽失敗';
      setError(message);
      setLoading(false);
      console.error('設定監聽錯誤:', message);
    }
  }, [chatRoomId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
