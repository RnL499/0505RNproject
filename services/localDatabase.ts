import AsyncStorage from '@react-native-async-storage/async-storage';

import { getChatRoomId } from '@/utils/chatUtils';

const STORAGE_KEY = '@chat_app_data';

export interface StoredUser {
  uid: string;
  name: string;
  email: string;
  password: string;
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
  users: StoredUser[];
  friendships: StoredFriendship[];
  friendRequests: StoredFriendRequest[];
  chatRooms: StoredChatRoom[];
  messages: Record<string, StoredMessage[]>;
  currentUserId: string | null;
}

const defaultData = (): AppData => ({
  users: [],
  friendships: [],
  friendRequests: [],
  chatRooms: [],
  messages: {},
  currentUserId: null,
});

function reviveDates(data: AppData): AppData {
  return data;
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const loaded = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaultData(),
      ...loaded,
      users: loaded.users ?? [],
      friendships: loaded.friendships ?? [],
      friendRequests: loaded.friendRequests ?? [],
      chatRooms: loaded.chatRooms ?? [],
      messages: loaded.messages ?? {},
      currentUserId: loaded.currentUserId ?? null,
    };
  } catch {
    return defaultData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateUid(): string {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateMessageId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function findUserByEmail(users: StoredUser[], email: string): StoredUser | undefined {
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(users: StoredUser[], uid: string): StoredUser | undefined {
  return users.find((u) => u.uid === uid);
}

export function searchUsers(
  users: StoredUser[],
  query: string,
  excludeUid?: string,
): StoredUser[] {
  const q = query.trim().toLowerCase();
  if (!q) return users.filter((u) => u.uid !== excludeUid);

  return users.filter((u) => {
    if (excludeUid && u.uid === excludeUid) return false;
    return (
      u.uid.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.searchName.includes(q)
    );
  });
}

export function getFriendUids(data: AppData, uid: string): string[] {
  return data.friendships
    .filter((f) => f.uid === uid)
    .map((f) => f.friendUid);
}

export function isFriend(data: AppData, uid: string, friendUid: string): boolean {
  return data.friendships.some((f) => f.uid === uid && f.friendUid === friendUid);
}

export function getOrCreateChatRoom(data: AppData, uid1: string, uid2: string): StoredChatRoom {
  const roomId = getChatRoomId(uid1, uid2);
  let room = data.chatRooms.find((r) => r.id === roomId);

  if (!room) {
    const user1 = findUserById(data.users, uid1);
    const user2 = findUserById(data.users, uid2);
    room = {
      id: roomId,
      participants: [uid1, uid2],
      participantNames: {
        [uid1]: user1?.name ?? 'Unknown',
        [uid2]: user2?.name ?? 'Unknown',
      },
      participantPhotos: {
        [uid1]: user1?.photoURL ?? '',
        [uid2]: user2?.photoURL ?? '',
      },
      lastMessage: '',
      lastMessageTime: null,
      lastMessageSenderId: '',
      unreadCount: { [uid1]: 0, [uid2]: 0 },
    };
    data.chatRooms.push(room);
    data.messages[roomId] = [];
  }

  return room;
}

export function syncRoomParticipantInfo(data: AppData, room: StoredChatRoom): void {
  room.participants.forEach((uid) => {
    const user = findUserById(data.users, uid);
    if (user) {
      room.participantNames[uid] = user.name;
      room.participantPhotos[uid] = user.photoURL;
    }
  });
}
