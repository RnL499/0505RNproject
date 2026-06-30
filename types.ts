export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  searchName: string;
  createdAt?: Date;
}

export interface FriendItem {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  addedAt?: Date;
}

export interface FriendRequestItem {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromPhotoURL: string;
  toName: string;
  toPhotoURL: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  content: string;
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageTime: Date | null;
  lastMessageSenderId: string;
  unreadCount?: Record<string, number>;
  friendUid: string;
  friendName: string;
  friendPhotoURL: string;
  isFriend: boolean;
}

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type ChatsStackParamList = {
  ChatList: undefined;
  Chat: { roomId: string; friendId: string; friendName: string; friendPhotoURL?: string };
};

export type BottomTabParamList = {
  Friends: undefined;
  Chats: undefined;
  Settings: undefined;
};
