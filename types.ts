// Type definitions for the chat app
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Conversation {
  userId: string;
  userName: string;
  messages: Message[];
}

export interface ChatData {
  users: User[];
  conversations: Conversation[];
}

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  Chat: { userId: string; userName: string };
};

export type BottomTabParamList = {
  Friends: undefined;
  Chats: undefined;
  Settings: undefined;
};
