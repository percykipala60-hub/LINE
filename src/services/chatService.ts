import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  onSnapshot, updateDoc, arrayUnion 
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'client' | 'admin';
  senderName: string;
  senderContact?: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

export interface ConversationSummary {
  id: string; // user UID or phone
  userName: string;
  userContact: string;
  userPhoto?: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadByAdmin: number;
  unreadByClient: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_CONVERSATIONS_KEY = 'line_chat_conversations';
const CHAT_CHANNEL_NAME = 'line_chat_realtime_channel';

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHAT_CHANNEL_NAME)
  : null;

export const chatService = {
  // Get all conversations from local cache
  getLocalConversations(): Record<string, ConversationSummary> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        /* ignore */
      }
    }
    return {};
  },

  // Save conversation in local cache
  saveLocalConversation(conv: ConversationSummary) {
    if (typeof window === 'undefined') return;
    const all = this.getLocalConversations();
    all[conv.id] = conv;
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(all));
  },

  // Send a message
  async sendMessage(
    conversationId: string, 
    sender: 'client' | 'admin', 
    text: string, 
    senderInfo: { name: string; contact?: string; photo?: string },
    imageUrl?: string
  ): Promise<ChatMessage> {
    const timestamp = Date.now();
    const newMsg: ChatMessage = {
      id: `msg_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      sender,
      senderName: senderInfo.name,
      senderContact: senderInfo.contact,
      text,
      imageUrl,
      timestamp,
      read: false,
    };

    // 1. Update local cache
    const all = this.getLocalConversations();
    const existing = all[conversationId] || {
      id: conversationId,
      userName: sender === 'client' ? senderInfo.name : 'Client',
      userContact: senderInfo.contact || '',
      userPhoto: senderInfo.photo,
      lastMessage: text || (imageUrl ? '📷 Photo partagée' : ''),
      lastMessageTimestamp: timestamp,
      unreadByAdmin: 0,
      unreadByClient: 0,
      updatedAt: timestamp,
      messages: [],
    };

    if (sender === 'client') {
      existing.userName = senderInfo.name;
      if (senderInfo.contact) existing.userContact = senderInfo.contact;
      if (senderInfo.photo) existing.userPhoto = senderInfo.photo;
      existing.unreadByAdmin = (existing.unreadByAdmin || 0) + 1;
    } else {
      existing.unreadByClient = (existing.unreadByClient || 0) + 1;
    }

    existing.lastMessage = text || (imageUrl ? '📷 Photo partagée' : '');
    existing.lastMessageTimestamp = timestamp;
    existing.updatedAt = timestamp;
    existing.messages = [...(existing.messages || []), newMsg];

    all[conversationId] = existing;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(all));
    }

    // 2. Broadcast immediately to other tabs/ports
    if (channel) {
      channel.postMessage({
        type: 'CHAT_MESSAGE_SENT',
        payload: { conversationId, message: newMsg, conversation: existing }
      });
    }

    // 3. Persist to Firestore if available
    if (db) {
      try {
        const convRef = doc(db, 'conversations', conversationId);
        await setDoc(convRef, {
          id: conversationId,
          userName: existing.userName,
          userContact: existing.userContact,
          userPhoto: existing.userPhoto || '',
          lastMessage: existing.lastMessage,
          lastMessageTimestamp: timestamp,
          unreadByAdmin: existing.unreadByAdmin,
          unreadByClient: existing.unreadByClient,
          updatedAt: timestamp,
          messages: arrayUnion(newMsg)
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore Chat Sync Warning:', err);
      }
    }

    return newMsg;
  },

  // Subscribe to a specific conversation's messages
  subscribeToConversation(
    conversationId: string, 
    callback: (messages: ChatMessage[], conversation?: ConversationSummary) => void
  ) {
    // 1. Initial local state
    const all = this.getLocalConversations();
    const current = all[conversationId];
    if (current) {
      callback(current.messages || [], current);
    } else {
      callback([], undefined);
    }

    // 2. BroadcastChannel listener
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CHAT_MESSAGE_SENT' && event.data?.payload?.conversationId === conversationId) {
        const payload = event.data.payload;
        callback(payload.conversation.messages, payload.conversation);
      } else if (event.data?.type === 'CONVERSATION_READ' && event.data?.payload?.conversationId === conversationId) {
        const local = this.getLocalConversations()[conversationId];
        if (local) callback(local.messages, local);
      }
    };
    if (channel) channel.addEventListener('message', handleBroadcast);

    // 3. Storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_CONVERSATIONS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const updated = parsed[conversationId];
          if (updated) callback(updated.messages || [], updated);
        } catch (err) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Firestore real-time listener
    let unsubFirestore = () => {};
    if (db) {
      try {
        unsubFirestore = onSnapshot(doc(db, 'conversations', conversationId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as ConversationSummary;
            this.saveLocalConversation(data);
            callback(data.messages || [], data);
          }
        }, () => {});
      } catch (e) { /* ignore */ }
    }

    return () => {
      if (channel) channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      unsubFirestore();
    };
  },

  // Mark conversation as read
  markAsRead(conversationId: string, reader: 'admin' | 'client') {
    const all = this.getLocalConversations();
    const conv = all[conversationId];
    if (conv) {
      if (reader === 'admin') conv.unreadByAdmin = 0;
      if (reader === 'client') conv.unreadByClient = 0;
      conv.messages = (conv.messages || []).map(m => {
        if (reader === 'admin' && m.sender === 'client') return { ...m, read: true };
        if (reader === 'client' && m.sender === 'admin') return { ...m, read: true };
        return m;
      });
      all[conversationId] = conv;
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(all));

      if (channel) {
        channel.postMessage({ type: 'CONVERSATION_READ', payload: { conversationId, reader } });
      }

      if (db) {
        try {
          const updateField = reader === 'admin' ? { unreadByAdmin: 0 } : { unreadByClient: 0 };
          updateDoc(doc(db, 'conversations', conversationId), updateField).catch(() => {});
        } catch (e) { /* ignore */ }
      }
    }
  }
};
