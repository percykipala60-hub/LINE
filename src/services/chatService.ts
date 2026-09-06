import { db } from '../firebase';
import { 
  collection, doc, setDoc, onSnapshot, updateDoc, arrayUnion 
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
  id: string; // user UID or guest ID
  userName: string;
  userContact: string;
  userPhoto?: string;
  userSlug?: string;
  clientLink?: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadByAdmin: number;
  unreadByClient: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_CONVERSATIONS_KEY = 'line_chat_conversations';
const CHAT_CHANNEL_NAME = 'line_chat_realtime_channel';

// Endpoints for unlimited real-time synchronization between Render client and local admin
const SYNC_ENDPOINTS: string[] = [
  'https://line-rge0.onrender.com/api/chat/sync',
  'http://localhost:3000/api/chat/sync',
];

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHAT_CHANNEL_NAME)
  : null;

// Local in-memory active listeners
type ConvListener = (messages: ChatMessage[], conversation?: ConversationSummary) => void;
type AllListener = (conversations: ConversationSummary[]) => void;

const inMemoryConvListeners = new Map<string, Set<ConvListener>>();
const inMemoryAllListeners = new Set<AllListener>();

import { supabaseClient } from './supabaseClient';

// Helper to push conversation updates to server and Supabase in background
async function pushToCloudRelay(conversations: Record<string, ConversationSummary>) {
  // 1. Supabase Sync (if configured via SQL Editor / Settings)
  if (supabaseClient.isConfigured()) {
    for (const conv of Object.values(conversations)) {
      supabaseClient.upsertConversation(conv).catch(() => {});
      if (conv.messages && conv.messages.length > 0) {
        const lastMsg = conv.messages[conv.messages.length - 1];
        supabaseClient.insertMessage(lastMsg).catch(() => {});
      }
    }
  }

  // 2. HTTP Server Relay (Local Vite middleware / Render API)
  const currentOrigin = typeof window !== 'undefined' ? `${window.location.origin}/api/chat/sync` : null;
  const targets = currentOrigin ? [currentOrigin, ...SYNC_ENDPOINTS] : SYNC_ENDPOINTS;

  for (const url of targets) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversations }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return;
    } catch (e) {
      /* Try next endpoint */
    }
  }
}

// Helper to fetch and merge server and Supabase updates
async function fetchAndMergeCloudRelay(): Promise<Record<string, ConversationSummary> | null> {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_CONVERSATIONS_KEY) : null;
  const localAll: Record<string, ConversationSummary> = raw ? JSON.parse(raw) : {};
  let hasChanges = false;
  const merged: Record<string, ConversationSummary> = { ...localAll };

  // 1. Supabase Fetch (Instant cross-database synchronization)
  if (supabaseClient.isConfigured()) {
    try {
      const [sbConvs, sbMsgs] = await Promise.all([
        supabaseClient.fetchConversations(),
        supabaseClient.fetchMessages(),
      ]);
      if (Array.isArray(sbConvs) && sbConvs.length > 0) {
        for (const c of sbConvs) {
          const convId = c.id;
          const convMsgs: ChatMessage[] = (Array.isArray(sbMsgs) ? sbMsgs : [])
            .filter((m: any) => m.conversation_id === convId)
            .map((m: any) => ({
              id: m.id,
              conversationId: m.conversation_id,
              sender: m.sender,
              senderName: m.sender_name,
              senderContact: m.sender_contact,
              text: m.text || '',
              imageUrl: m.image_url,
              timestamp: Number(m.timestamp),
              read: Boolean(m.read),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

          const lConv = merged[convId];
          const isNewer = Number(c.updated_at || 0) > Number(lConv?.updatedAt || 0);
          const hasMoreMsgs = convMsgs.length > (lConv?.messages || []).length;

          if (!lConv || isNewer || hasMoreMsgs) {
            merged[convId] = {
              id: convId,
              userName: c.user_name || lConv?.userName || 'Client',
              userContact: c.user_contact || lConv?.userContact || '',
              userPhoto: c.user_photo || lConv?.userPhoto || '',
              lastMessage: c.last_message || (convMsgs[convMsgs.length - 1]?.text ?? ''),
              lastMessageTimestamp: Number(c.last_message_timestamp) || (convMsgs[convMsgs.length - 1]?.timestamp ?? Date.now()),
              unreadByAdmin: c.unread_by_admin ?? 0,
              unreadByClient: c.unread_by_client ?? 0,
              updatedAt: Number(c.updated_at) || Date.now(),
              messages: convMsgs.length > 0 ? convMsgs : (lConv?.messages || []),
            };
            hasChanges = true;
          }
        }
      }
    } catch (e) {
      /* Continue to relay endpoints */
    }
  }

  // 2. HTTP Server Relay (Local middleware / Render)
  const currentOrigin = typeof window !== 'undefined' ? `${window.location.origin}/api/chat/conversations` : null;
  const targets = currentOrigin 
    ? [currentOrigin, ...SYNC_ENDPOINTS.map(u => u.replace('/sync', '/conversations'))]
    : SYNC_ENDPOINTS.map(u => u.replace('/sync', '/conversations'));

  for (const url of targets) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;

      const json = await res.json();
      const cloudConvs: Record<string, ConversationSummary> = json?.conversations;
      if (!cloudConvs || typeof cloudConvs !== 'object') continue;

      for (const [id, cConv] of Object.entries(cloudConvs)) {
        const lConv = merged[id];
        if (!lConv) {
          merged[id] = cConv;
          hasChanges = true;
        } else {
          // Merge messages de-duplicating by ID
          const msgMap = new Map<string, ChatMessage>();
          (lConv.messages || []).forEach(m => msgMap.set(m.id, m));
          (cConv.messages || []).forEach(m => msgMap.set(m.id, m));
          const mergedMsgs = Array.from(msgMap.values()).sort((a, b) => a.timestamp - b.timestamp);

          const isNewer = (cConv.updatedAt || 0) > (lConv.updatedAt || 0);
          const hasMoreMsgs = mergedMsgs.length > (lConv.messages || []).length;

          if (hasMoreMsgs || isNewer) {
            merged[id] = {
              ...lConv,
              ...cConv,
              messages: mergedMsgs,
              lastMessage: mergedMsgs.length > 0 ? (mergedMsgs[mergedMsgs.length - 1].text || lConv.lastMessage) : lConv.lastMessage,
              lastMessageTimestamp: mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1].timestamp : lConv.lastMessageTimestamp,
              unreadByAdmin: cConv.unreadByAdmin ?? lConv.unreadByAdmin,
              unreadByClient: cConv.unreadByClient ?? lConv.unreadByClient,
            };
            hasChanges = true;
          }
        }
      }

      if (hasChanges && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(merged));
      }

      return hasChanges ? merged : null;
    } catch (e) {
      /* Try next endpoint */
    }
  }

  if (hasChanges && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(merged));
    return merged;
  }

  return null;
}

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

  // Send a message (Optimistic, non-blocking, multi-channel)
  async sendMessage(
    conversationId: string, 
    sender: 'client' | 'admin', 
    text: string, 
    senderInfo: { name: string; contact?: string; photo?: string; userSlug?: string; clientLink?: string },
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
      userSlug: senderInfo.userSlug,
      clientLink: senderInfo.clientLink,
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
      if (senderInfo.userSlug) existing.userSlug = senderInfo.userSlug;
      if (senderInfo.clientLink) existing.clientLink = senderInfo.clientLink;
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

    // 2. Immediate in-memory notification for current tab (<0ms)
    const convListeners = inMemoryConvListeners.get(conversationId);
    if (convListeners) {
      convListeners.forEach(cb => cb(existing.messages, existing));
    }
    inMemoryAllListeners.forEach(cb => cb(Object.values(all)));

    // 3. Broadcast to other tabs of same origin
    if (channel) {
      channel.postMessage({
        type: 'CHAT_MESSAGE_SENT',
        payload: { conversationId, message: newMsg, conversation: existing }
      });
    }

    // 4. Background Sync to Server Relay (cross-domain Render <-> Admin)
    pushToCloudRelay(all);

    // 4b. Sync to Supabase directly
    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertConversation(existing).catch(() => {});
      supabaseClient.insertMessage(newMsg).catch(() => {});
    }

    // 5. Background Sync to Firestore if available (non-blocking)
    if (db) {
      try {
        const convRef = doc(db, 'conversations', conversationId);
        setDoc(convRef, {
          id: conversationId,
          userName: existing.userName,
          userContact: existing.userContact,
          userPhoto: existing.userPhoto || '',
          userSlug: existing.userSlug || '',
          clientLink: existing.clientLink || '',
          lastMessage: existing.lastMessage,
          lastMessageTimestamp: timestamp,
          unreadByAdmin: existing.unreadByAdmin,
          unreadByClient: existing.unreadByClient,
          updatedAt: timestamp,
          messages: arrayUnion(newMsg)
        }, { merge: true }).catch(() => {});
      } catch (err) {
        /* silent catch */
      }
    }

    return newMsg;
  },

  // Subscribe to a specific conversation's messages
  subscribeToConversation(
    conversationId: string, 
    callback: (messages: ChatMessage[], conversation?: ConversationSummary) => void
  ) {
    // 1. Initial state from local cache
    const all = this.getLocalConversations();
    const current = all[conversationId];
    if (current) {
      callback(current.messages || [], current);
    } else {
      callback([], undefined);
    }

    // 2. Register in-memory listener for current tab
    if (!inMemoryConvListeners.has(conversationId)) {
      inMemoryConvListeners.set(conversationId, new Set());
    }
    inMemoryConvListeners.get(conversationId)!.add(callback);

    // 3. BroadcastChannel listener
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

    // 4. Storage listener
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

    // 5. Server Relay periodic polling for cross-origin sync
    const pollInterval = setInterval(async () => {
      const merged = await fetchAndMergeCloudRelay();
      if (merged && merged[conversationId]) {
        callback(merged[conversationId].messages || [], merged[conversationId]);
      }
    }, 2000);

    // Initial server fetch
    fetchAndMergeCloudRelay().then((merged) => {
      if (merged && merged[conversationId]) {
        callback(merged[conversationId].messages || [], merged[conversationId]);
      }
    });

    // 6. Firestore real-time listener if available
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
      const set = inMemoryConvListeners.get(conversationId);
      if (set) set.delete(callback);
      if (channel) channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
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

      // In-memory notify
      const convListeners = inMemoryConvListeners.get(conversationId);
      if (convListeners) {
        convListeners.forEach(cb => cb(conv.messages, conv));
      }

      if (channel) {
        channel.postMessage({ type: 'CONVERSATION_READ', payload: { conversationId, reader } });
      }

      pushToCloudRelay(all);

      if (supabaseClient.isConfigured()) {
        supabaseClient.markAsRead(conversationId, reader).catch(() => {});
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
