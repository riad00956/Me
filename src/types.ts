export type MessageType = 'text' | 'photo' | 'video' | 'document' | 'sticker';

export interface Message {
  id: string;
  chatId: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  type: MessageType;
  content: string; // text content or file id
  mediaUrl?: string;
  caption?: string;
  timestamp: number;
}

export interface Chat {
  id: number;
  first_name: string;
  username?: string;
  lastMessage?: Message;
  photoUrl?: string | null;
  blocked?: boolean;
}

export interface BotInfo {
  token: string;
  id: number;
  first_name: string;
  username?: string;
  photoUrl?: string | null;
}

export interface AppState {
  bots: BotInfo[];
  activeBotToken: string | null;
  chats: Chat[];
  messages: Message[];
  isDarkMode: boolean;
  primaryColor: string;
}
