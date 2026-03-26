export type MessageType = 'text' | 'photo' | 'video' | 'audio' | 'voice' | 'document' | 'sticker';

export interface ReplyTo {
  id: string;
  text: string;
  senderName: string;
}

export interface Message {
  id: string;
  chatId: number;
  from: { id: number; first_name: string; username?: string };
  type: MessageType;
  content: string;
  mediaUrl?: string;
  caption?: string;
  timestamp: number;
  replyTo?: ReplyTo;
  deleted?: boolean;
  reactions?: string[];
}

export interface Chat {
  id: number;
  first_name: string;
  username?: string;
  lastMessage?: Message;
  photoUrl?: string | null;
  blocked?: boolean;
  unreadCount?: number;
  pinned?: boolean;
  muted?: boolean;
}

export interface BotInfo {
  token: string;
  id: number;
  first_name: string;
  username?: string;
  photoUrl?: string | null;
}
