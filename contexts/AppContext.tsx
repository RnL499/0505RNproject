import { signOut } from 'firebase/auth';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { auth } from '@/api/firebaseConfig';
import {
    AppData,
    StoredChatRoom,
    StoredFriendRequest,
    StoredMessage,
    StoredUser,
    findUserByEmail,
    findUserById,
    generateMessageId,
    generateUid,
    getFriendUids,
    getOrCreateChatRoom,
    isFriend,
    loadAppData,
    saveAppData,
    searchUsers,
    syncRoomParticipantInfo,
} from '@/services/localDatabase';
import type { ChatMessage, ChatRoom, FriendItem, FriendRequestItem, UserProfile } from '@/types';

interface AppContextValue {
  loading: boolean;
  currentUser: UserProfile | null;
  friends: FriendItem[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
  chatRooms: ChatRoom[];
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  searchAllUsers: (query: string) => UserProfile[];
  addFriend: (friendUid: string) => Promise<void>;
  acceptFriendRequest: (fromUid: string) => Promise<void>;
  declineFriendRequest: (fromUid: string) => Promise<void>;
  updateProfile: (name: string, photoURL: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getMessages: (roomId: string) => ChatMessage[];
  sendMessage: (roomId: string, content: string) => Promise<void>;
  markRoomAsRead: (roomId: string) => Promise<void>;
  markRoomAsUnread: (roomId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function toUserProfile(user: StoredUser): UserProfile {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    searchName: user.searchName,
    createdAt: new Date(user.createdAt),
  };
}

function toChatMessage(msg: StoredMessage): ChatMessage {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderPhotoURL: msg.senderPhotoURL,
    content: msg.content,
    createdAt: new Date(msg.createdAt),
  };
}

function toChatRoom(room: StoredChatRoom, currentUid: string, data: AppData): ChatRoom {
  const friendUid = room.participants.find((id) => id !== currentUid) ?? '';
  return {
    id: room.id,
    participants: room.participants,
    participantNames: room.participantNames,
    participantPhotos: room.participantPhotos,
    lastMessage: room.lastMessage,
    lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : null,
    lastMessageSenderId: room.lastMessageSenderId,
    unreadCount: room.unreadCount,
    friendUid,
    friendName: room.participantNames[friendUid] ?? 'Unknown',
    friendPhotoURL: room.participantPhotos[friendUid] ?? '',
    isFriend: isFriend(data, currentUid, friendUid),
  };
}

function toFriendRequest(request: StoredFriendRequest, data: AppData): FriendRequestItem {
  const fromUser = findUserById(data.users, request.fromUid);
  const toUser = findUserById(data.users, request.toUid);
  return {
    id: request.id,
    fromUid: request.fromUid,
    toUid: request.toUid,
    fromName: fromUser?.name ?? 'Unknown',
    fromPhotoURL: fromUser?.photoURL ?? '',
    toName: toUser?.name ?? 'Unknown',
    toPhotoURL: toUser?.photoURL ?? '',
    createdAt: new Date(request.createdAt),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveAppData(next);
  }, []);

  const refresh = useCallback(async () => {
    const loaded = await loadAppData();
    setData(loaded);
  }, []);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  const currentUser = useMemo(() => {
    if (!data?.currentUserId) return null;
    const user = findUserById(data.users, data.currentUserId);
    return user ? toUserProfile(user) : null;
  }, [data]);

  const friends = useMemo((): FriendItem[] => {
    if (!data?.currentUserId) return [];
    const friendIds = getFriendUids(data, data.currentUserId);
    return friendIds
      .map((uid) => findUserById(data.users, uid))
      .filter((u): u is StoredUser => !!u)
      .map((u) => ({
        uid: u.uid,
        name: u.name,
        email: u.email,
        photoURL: u.photoURL,
      }));
  }, [data]);

  const incomingRequests = useMemo(() => {
    if (!data?.currentUserId) return [];
    return data.friendRequests
      .filter((request) => request.toUid === data.currentUserId)
      .map((request) => toFriendRequest(request, data));
  }, [data]);

  const outgoingRequests = useMemo(() => {
    if (!data?.currentUserId) return [];
    return data.friendRequests
      .filter((request) => request.fromUid === data.currentUserId)
      .map((request) => toFriendRequest(request, data));
  }, [data]);

  const chatRooms = useMemo((): ChatRoom[] => {
    if (!data?.currentUserId) return [];
    return data.chatRooms
      .filter((room) => room.participants.includes(data.currentUserId!))
      .map((room) => toChatRoom(room, data.currentUserId!, data))
      .sort((a, b) => {
        const ta = a.lastMessageTime?.getTime() ?? 0;
        const tb = b.lastMessageTime?.getTime() ?? 0;
        return tb - ta;
      });
  }, [data]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (!data) return;
      const trimmedEmail = email.trim().toLowerCase();
      if (findUserByEmail(data.users, trimmedEmail)) {
        throw new Error('此 email 已被註冊');
      }
      const user: StoredUser = {
        uid: generateUid(),
        name: name.trim(),
        email: trimmedEmail,
        password,
        photoURL: '',
        searchName: name.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      await persist({ ...data, users: [...data.users, user], currentUserId: user.uid });
    },
    [data, persist],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (!data) return;
      const user = findUserByEmail(data.users, email);
      if (!user || user.password !== password) {
        throw new Error('Email 或密碼錯誤');
      }
      await persist({ ...data, currentUserId: user.uid });
    },
    [data, persist],
  );

  const logout = useCallback(async () => {
    if (!data) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
    await persist({ ...data, currentUserId: null });
  }, [data, persist]);

  const searchAllUsers = useCallback(
    (query: string): UserProfile[] => {
      if (!data) return [];
      return searchUsers(data.users, query, data.currentUserId ?? undefined).map(toUserProfile);
    },
    [data],
  );

  const addFriend = useCallback(
    async (friendUid: string) => {
      if (!data?.currentUserId) return;
      if (friendUid === data.currentUserId) {
        throw new Error('不能加自己為好友');
      }
      if (isFriend(data, data.currentUserId, friendUid)) {
        throw new Error('已經是好友了');
      }
      if (
        data.friendRequests.some(
          (request) =>
            request.fromUid === data.currentUserId && request.toUid === friendUid,
        )
      ) {
        throw new Error('邀請已送出');
      }
      if (
        data.friendRequests.some(
          (request) =>
            request.fromUid === friendUid && request.toUid === data.currentUserId,
        )
      ) {
        throw new Error('對方已邀請你，請先接受邀請');
      }

      const next: AppData = {
        ...data,
        friendRequests: [
          ...data.friendRequests,
          {
            id: generateUid(),
            fromUid: data.currentUserId,
            toUid: friendUid,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      getOrCreateChatRoom(next, data.currentUserId, friendUid);
      await persist(next);
    },
    [data, persist],
  );

  const acceptFriendRequest = useCallback(
    async (fromUid: string) => {
      if (!data?.currentUserId) return;
      const request = data.friendRequests.find(
        (item) => item.fromUid === fromUid && item.toUid === data.currentUserId,
      );
      if (!request) {
        throw new Error('找不到該好友邀請');
      }

      const nextFriendships = [
        ...data.friendships,
        { uid: data.currentUserId, friendUid: fromUid, addedAt: new Date().toISOString() },
      ];
      if (!data.friendships.some((item) => item.uid === fromUid && item.friendUid === data.currentUserId)) {
        nextFriendships.push({
          uid: fromUid,
          friendUid: data.currentUserId,
          addedAt: new Date().toISOString(),
        });
      }

      const next: AppData = {
        ...data,
        friendships: nextFriendships,
        friendRequests: data.friendRequests.filter(
          (item) => !(item.fromUid === fromUid && item.toUid === data.currentUserId),
        ),
      };
      getOrCreateChatRoom(next, data.currentUserId, fromUid);
      await persist(next);
    },
    [data, persist],
  );

  const declineFriendRequest = useCallback(
    async (fromUid: string) => {
      if (!data?.currentUserId) return;
      const next: AppData = {
        ...data,
        friendRequests: data.friendRequests.filter(
          (item) => !(item.fromUid === fromUid && item.toUid === data.currentUserId),
        ),
      };
      await persist(next);
    },
    [data, persist],
  );

  const updateProfile = useCallback(
    async (name: string, photoURL: string) => {
      if (!data?.currentUserId) return;
      const users = data.users.map((u) =>
        u.uid === data.currentUserId
          ? { ...u, name: name.trim(), photoURL, searchName: name.trim().toLowerCase() }
          : u,
      );
      const next: AppData = { ...data, users };
      next.chatRooms.forEach((room) => {
        if (room.participants.includes(data.currentUserId!)) {
          syncRoomParticipantInfo(next, room);
        }
      });
      await persist(next);
    },
    [data, persist],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!data?.currentUserId) return;
      const user = findUserById(data.users, data.currentUserId);
      if (!user || user.password !== currentPassword) {
        throw new Error('目前密碼不正確');
      }
      const users = data.users.map((u) =>
        u.uid === data.currentUserId ? { ...u, password: newPassword } : u,
      );
      await persist({ ...data, users });
    },
    [data, persist],
  );

  const getMessages = useCallback(
    (roomId: string): ChatMessage[] => {
      if (!data) return [];
      return (data.messages[roomId] ?? []).map(toChatMessage);
    },
    [data],
  );

  const sendMessage = useCallback(
    async (roomId: string, content: string) => {
      if (!data?.currentUserId) return;
      const user = findUserById(data.users, data.currentUserId);
      if (!user) return;

      const trimmed = content.trim();
      if (!trimmed) return;

      const msg: StoredMessage = {
        id: generateMessageId(),
        roomId,
        senderId: user.uid,
        senderName: user.name,
        senderPhotoURL: user.photoURL,
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      const room = data.chatRooms.find((r) => r.id === roomId);
      if (!room) return;

      const otherUid = room.participants.find((id) => id !== data.currentUserId);
      const unreadCount = { ...room.unreadCount };
      if (otherUid) {
        unreadCount[otherUid] = (unreadCount[otherUid] ?? 0) + 1;
      }

      const updatedRoom: StoredChatRoom = {
        ...room,
        lastMessage: trimmed,
        lastMessageTime: msg.createdAt,
        lastMessageSenderId: user.uid,
        unreadCount,
      };

      const next: AppData = {
        ...data,
        chatRooms: data.chatRooms.map((r) => (r.id === roomId ? updatedRoom : r)),
        messages: {
          ...data.messages,
          [roomId]: [...(data.messages[roomId] ?? []), msg],
        },
      };
      await persist(next);
    },
    [data, persist],
  );

  const markRoomAsRead = useCallback(
    async (roomId: string) => {
      if (!data?.currentUserId) return;
      const room = data.chatRooms.find((r) => r.id === roomId);
      if (!room || !room.unreadCount[data.currentUserId]) return;

      const next: AppData = {
        ...data,
        chatRooms: data.chatRooms.map((r) =>
          r.id === roomId
            ? { ...r, unreadCount: { ...r.unreadCount, [data.currentUserId!]: 0 } }
            : r,
        ),
      };
      await persist(next);
    },
    [data, persist],
  );

  const markRoomAsUnread = useCallback(
    async (roomId: string) => {
      if (!data?.currentUserId) return;
      const room = data.chatRooms.find((r) => r.id === roomId);
      if (!room) return;
      if (room.lastMessageSenderId === data.currentUserId) return;
      const otherUid = room.participants.find((id) => id !== data.currentUserId);
      if (!otherUid) return;

      const next: AppData = {
        ...data,
        chatRooms: data.chatRooms.map((r) =>
          r.id === roomId
            ? { ...r, unreadCount: { ...r.unreadCount, [data.currentUserId!]: 1 } }
            : r,
        ),
      };
      await persist(next);
    },
    [data, persist],
  );

  const value = useMemo(
    () => ({
      loading,
      currentUser,
      friends,
      incomingRequests,
      outgoingRequests,
      chatRooms,
      register,
      login,
      logout,
      searchAllUsers,
      addFriend,
      acceptFriendRequest,
      declineFriendRequest,
      updateProfile,
      changePassword,
      getMessages,
      sendMessage,
      markRoomAsRead,
      markRoomAsUnread,
      refresh,
    }),
    [
      loading,
      currentUser,
      friends,
      incomingRequests,
      outgoingRequests,
      chatRooms,
      register,
      login,
      logout,
      searchAllUsers,
      addFriend,
      acceptFriendRequest,
      declineFriendRequest,
      updateProfile,
      changePassword,
      getMessages,
      sendMessage,
      markRoomAsRead,
      markRoomAsUnread,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
