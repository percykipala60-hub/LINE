// ==============================================================================
// SUPABASE CLIENT (REST API Natif - Zéro Dépendance Lourde)
// ==============================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_URL_KEY = 'line_supabase_url';
const STORAGE_KEY_KEY = 'line_supabase_anon_key';

export const supabaseClient = {
  // Récupération de la configuration Supabase (depuis localStorage ou variables d'environnement Vite)
  getConfig(): SupabaseConfig | null {
    if (typeof window === 'undefined') return null;
    const url = localStorage.getItem(STORAGE_URL_KEY) || (import.meta as any).env?.VITE_SUPABASE_URL;
    const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      return { url: url.trim().replace(/\/+$/, ''), anonKey: anonKey.trim() };
    }
    return null;
  },

  // Définir ou modifier la configuration Supabase
  setConfig(url: string, anonKey: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_URL_KEY, url.trim().replace(/\/+$/, ''));
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    window.dispatchEvent(new Event('supabase_config_changed'));
  },

  isConfigured(): boolean {
    return Boolean(this.getConfig());
  },

  // Récupérer toutes les conversations depuis Supabase
  async fetchConversations(): Promise<any[]> {
    const config = this.getConfig();
    if (!config) return [];
    try {
      const res = await fetch(`${config.url}/rest/v1/conversations?select=*&order=updated_at.desc`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Récupérer les messages
  async fetchMessages(conversationId?: string): Promise<any[]> {
    const config = this.getConfig();
    if (!config) return [];
    try {
      const query = conversationId
        ? `${config.url}/rest/v1/messages?conversation_id=eq.${encodeURIComponent(conversationId)}&order=timestamp.asc`
        : `${config.url}/rest/v1/messages?order=timestamp.asc`;
      const res = await fetch(query, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Enregistrer ou mettre à jour une conversation
  async upsertConversation(conv: any): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;
    try {
      const payload = {
        id: conv.id,
        user_name: conv.userName || 'Client',
        user_contact: conv.userContact || '',
        user_photo: conv.userPhoto || '',
        last_message: conv.lastMessage || '',
        last_message_timestamp: conv.lastMessageTimestamp || Date.now(),
        unread_by_admin: conv.unreadByAdmin ?? 0,
        unread_by_client: conv.unreadByClient ?? 0,
        updated_at: conv.updatedAt || Date.now(),
      };
      const res = await fetch(`${config.url}/rest/v1/conversations`, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Enregistrer un nouveau message
  async insertMessage(msg: any): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;
    try {
      const payload = {
        id: msg.id,
        conversation_id: msg.conversationId,
        sender: msg.sender,
        sender_name: msg.senderName,
        sender_contact: msg.senderContact || '',
        text: msg.text || '',
        image_url: msg.imageUrl || null,
        timestamp: msg.timestamp || Date.now(),
        read: Boolean(msg.read),
      };
      const res = await fetch(`${config.url}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Marquer les messages d'une conversation comme lus
  async markAsRead(conversationId: string, forSender: 'client' | 'admin'): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;
    try {
      // Mettre à jour les compteurs de la conversation
      const updateData = forSender === 'admin' 
        ? { unread_by_admin: 0 } 
        : { unread_by_client: 0 };
      
      await fetch(`${config.url}/rest/v1/conversations?id=eq.${encodeURIComponent(conversationId)}`, {
        method: 'PATCH',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      return true;
    } catch {
      return false;
    }
  }
};
