/**
 * Firestore 資料庫服務層
 * 完全替代 localDatabase.ts，提供相同的介面但使用 Firebase Firestore
 */

import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where
} from 'firebase/firestore';

import { auth, db } from '@/api/firebaseConfig';

// 複用 localDatabase 中的型別定義
export interface StoredUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  searchName: string;
  createdAt: string;
}

export interface StoredFriendship {
  uid: string;
  friendUid: string;
  addedAt: string;
}

export interface StoredFriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  content: string;
  createdAt: string;
}

export interface StoredChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageTime: string | null;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
}

export interface AppData {
  currentUserId: string | null;
  users: StoredUser[];
  friendships: StoredFriendship[];
  friendRequests: StoredFriendRequest[];
  chatRooms: StoredChatRoom[];
  messages: StoredMessage[];
}

const USERS_COLLECTION = 'users';
const FRIENDSHIPS_COLLECTION = 'friendships';
const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const CHAT_ROOMS_COLLECTION = 'chatRooms';
const MESSAGES_COLLECTION = 'messages';
const APP_CONFIG_COLLECTION = 'appConfig';

/**
 * 加載應用資料 - 從 Firestore 取得所有資料
 */
export const loadAppData = async (): Promise<AppData> => {
  try {
    const currentUser = auth.currentUser;
    const currentUserId = currentUser?.uid || null;

    console.log('📖 從 Firestore 加載應用資料...');

    // 平行加載所有集合
    const [usersSnap, friendshipsSnap, friendRequestsSnap, chatRoomsSnap, messagesSnap] = await Promise.all(
      [
        getDocs(collection(db, USERS_COLLECTION)),
        currentUserId ? getDocs(query(collection(db, FRIENDSHIPS_COLLECTION), where('uid', '==', currentUserId))) : Promise.resolve({ docs: [] }),
        currentUserId ? getDocs(query(collection(db, FRIEND_REQUESTS_COLLECTION), where('toUid', '==', currentUserId))) : Promise.resolve({ docs: [] }),
        getDocs(collection(db, CHAT_ROOMS_COLLECTION)),
        getDocs(collection(db, MESSAGES_COLLECTION)),
      ] as const,
    );

    const users: StoredUser[] = usersSnap.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    } as StoredUser));

    const friendships: StoredFriendship[] = (friendshipsSnap as any).docs.map((docSnap: any) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as StoredFriendship[];

    const friendRequests: StoredFriendRequest[] = (friendRequestsSnap as any).docs.map((docSnap: any) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as StoredFriendRequest[];

    const chatRooms: StoredChatRoom[] = chatRoomsSnap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as StoredChatRoom));

    const messages: StoredMessage[] = messagesSnap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as StoredMessage));

    console.log('✅ Firestore 資料加載完成');

    return {
      currentUserId,
      users,
      friendships,
      friendRequests,
      chatRooms,
      messages,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '加載失敗';
    console.error('❌ Firestore 加載錯誤:', message);
    throw error;
  }
};

/**
 * 保存應用資料 - 更新 Firestore
 */
export const saveAppData = async (data: AppData): Promise<void> => {
  try {
    console.log('💾 保存資料到 Firestore...');

    // 保存使用者
    for (const user of data.users) {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await setDoc(userRef, user, { merge: true });
    }

    // 保存好友關係
    for (const friendship of data.friendships) {
      const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendship.uid + '_' + friendship.friendUid);
      await setDoc(friendshipRef, friendship, { merge: true });
    }

    // 保存好友邀請
    for (const request of data.friendRequests) {
      const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, request.id);
      await setDoc(requestRef, request, { merge: true });
    }

    // 保存聊天室
    for (const room of data.chatRooms) {
      const roomRef = doc(db, CHAT_ROOMS_COLLECTION, room.id);
      await setDoc(roomRef, room, { merge: true });
    }

    // 保存訊息
    for (const message of data.messages) {
      const messageRef = doc(db, MESSAGES_COLLECTION, message.id);
      await setDoc(messageRef, message, { merge: true });
    }

    console.log('✅ 資料保存完成');
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失敗';
    console.error('❌ Firestore 保存錯誤:', message);
    throw error;
  }
};

/**
 * 幫助函數 - 查找使用者
 */
export const findUserById = (users: StoredUser[], uid: string): StoredUser | undefined => {
  return users.find((u) => u.uid === uid);
};

export const findUserByEmail = (users: StoredUser[], email: string): StoredUser | undefined => {
  return users.find((u) => u.email === email);
};

/**
 * 幫助函數 - 取得好友 UID
 */
export const getFriendUids = (data: AppData, uid: string): string[] => {
  return data.friendships
    .filter((f) => f.uid === uid)
    .map((f) => f.friendUid);
};

/**
 * 幫助函數 - 檢查是否為好友
 */
export const isFriend = (data: AppData, uid1: string, uid2: string): boolean => {
  return data.friendships.some(
    (f) => (f.uid === uid1 && f.friendUid === uid2) || (f.uid === uid2 && f.friendUid === uid1),
  );
};

/**
 * 幫助函數 - 搜尋使用者
 */
export const searchUsers = (
  users: StoredUser[], 
  query: string, 
  currentUserId?: string,
): StoredUser[] => {
  const lowerQuery = query.toLowerCase();
  return users.filter(
    (u) =>
      u.uid !== currentUserId &&
      (u.searchName.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery)),
  );
};

/**
 * 生成 ID
 */
export const generateUid = (): string => {
  return 'uid_' + Math.random().toString(36).substr(2, 9);
};

export const generateMessageId = (): string => {
  return 'msg_' + Math.random().toString(36).substr(2, 9);
};

/**
 * 取得或建立聊天室
 */
export const getOrCreateChatRoom = (
  chatRooms: StoredChatRoom[],
  uid1: string,
  uid2: string,
  participantNames: Record<string, string>,
  participantPhotos: Record<string, string>,
): StoredChatRoom => {
  const room = chatRooms.find(
    (r) => r.participants.includes(uid1) && r.participants.includes(uid2),
  );

  if (room) {
    return room;
  }

  const newRoom: StoredChatRoom = {
    id: 'room_' + Math.random().toString(36).substr(2, 9),
    participants: [uid1, uid2],
    participantNames,
    participantPhotos,
    lastMessage: '',
    lastMessageTime: null,
    lastMessageSenderId: '',
    unreadCount: { [uid1]: 0, [uid2]: 0 },
  };

  return newRoom;
};

/**
 * 同步聊天室參與者資訊
 */
export const syncRoomParticipantInfo = (
  room: StoredChatRoom,
  users: StoredUser[],
): void => {
  for (const uid of room.participants) {
    const user = findUserById(users, uid);
    if (user) {
      room.participantNames[uid] = user.name;
      room.participantPhotos[uid] = user.photoURL;
    }
  }
};

export default {
  loadAppData,
  saveAppData,
  findUserById,
  findUserByEmail,
  getFriendUids,
  isFriend,
  searchUsers,
  generateUid,
  generateMessageId,
  getOrCreateChatRoom,
  syncRoomParticipantInfo,
};
