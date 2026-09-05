import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, User, Phone, ArrowLeft, Store, Image as ImageIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { SellerContact } from '../types';
import { chatService, ChatMessage } from '../services/chatService';
import { AppUser } from '../services/authService';

interface ClientChatViewProps {
  sellerContact: SellerContact;
  onBackToStore: () => void;
  user?: AppUser | null;
  onRequireAuth?: (reason: 'chat') => void;
}

export const ClientChatView: React.FC<ClientChatViewProps> = ({
  sellerContact,
  onBackToStore,
  user,
  onRequireAuth,
}) => {
  // Determine stable conversation ID
  const conversationId = React.useMemo(() => {
    if (user?.uid) return user.uid;
    if (typeof window !== 'undefined') {
      const savedGuestId = localStorage.getItem('line_guest_chat_id');
      if (savedGuestId) return savedGuestId;
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem('line_guest_chat_id', newGuestId);
      return newGuestId;
    }
    return 'guest_default';
  }, [user?.uid]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('line_guest_name') || '';
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    return localStorage.getItem('line_guest_phone') || '';
  });
  const [showIdentityPrompt, setShowIdentityPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time conversation messages
  useEffect(() => {
    chatService.markAsRead(conversationId, 'client');
    const unsubscribe = chatService.subscribeToConversation(conversationId, (convMsgs) => {
      if (convMsgs.length === 0) {
        // Welcome message if conversation is brand new
        setMessages([
          {
            id: 'msg-welcome',
            conversationId,
            sender: 'admin',
            senderName: 'Service Commercial LINE',
            text: 'Bonjour et bienvenue chez LINE ! Vous êtes en relation directe avec notre distributeur à Kinshasa. Posez-nous vos questions sur les tailles, les matières ou la livraison en mains propres.',
            timestamp: Date.now() - 60000,
            read: true,
          }
        ]);
      } else {
        setMessages(convMsgs);
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // If user is not logged in and has not entered a name yet, prompt auth or quick name
    if (!user && !guestName.trim()) {
      if (onRequireAuth) {
        onRequireAuth('chat');
        return;
      }
    }

    const textToSend = inputText.trim();
    setInputText('');

    const senderName = user?.displayName || guestName.trim() || 'Client LINE';
    const senderContact = user?.phoneNumber || user?.email || guestPhone.trim() || '';

    await chatService.sendMessage(
      conversationId,
      'client',
      textToSend,
      {
        name: senderName,
        contact: senderContact,
        photo: user?.photoURL,
      }
    );
  };

  const handleSendQuick = async (quickText: string) => {
    if (!user && !guestName.trim() && onRequireAuth) {
      onRequireAuth('chat');
      return;
    }

    const senderName = user?.displayName || guestName.trim() || 'Client LINE';
    const senderContact = user?.phoneNumber || user?.email || guestPhone.trim() || '';

    await chatService.sendMessage(
      conversationId,
      'client',
      quickText,
      {
        name: senderName,
        contact: senderContact,
        photo: user?.photoURL,
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-170px)] min-h-[520px] flex flex-col bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
            title="Retour à la boutique"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-emerald-600 dark:to-teal-500 text-white flex items-center justify-center shadow-sm">
              <span className="font-logo text-xl">L</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white dark:border-[#121824]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Service Distribution LINE</span>
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              En direct • Réponse personnalisée
            </p>
          </div>
        </div>

        {/* WhatsApp Fast fallback */}
        <a
          href={`https://wa.me/${sellerContact.whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

      {/* Guest Identification prompt banner if not signed in */}
      {!user && !guestName && (
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <User className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pour une réponse personnalisée avec votre nom :</span>
          </div>
          <button
            type="button"
            onClick={() => onRequireAuth && onRequireAuth('chat')}
            className="px-3 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] hover:opacity-90 cursor-pointer"
          >
            Se connecter
          </button>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40 dark:bg-[#0E131F]/50">
        <div className="text-center py-2">
          <span className="px-3 py-1 rounded-full text-[11px] bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 font-medium">
            Messagerie directe client • Livraison en mains propres à Kinshasa
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'client';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-slate-400 mb-1 px-1">
                {isMe ? (user?.displayName || guestName || 'Vous') : (msg.senderName || 'Service LINE')}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 shadow-xs text-xs sm:text-sm ${
                  isMe
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
                }`}
              >
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-60 border border-black/10">
                    <img 
                      src={msg.imageUrl} 
                      alt="Photo article" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isMe ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Inquiries */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-[#121824]">
        {[
          'Est-ce disponible en taille M ?',
          'Quels sont les délais de livraison ?',
          'Puis-je essayer avant de régler en mains propres ?',
          'Avez-vous d\'autres couleurs pour cet article ?'
        ].map((quick, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendQuick(quick)}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#121824] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Posez votre question à notre distributeur..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
