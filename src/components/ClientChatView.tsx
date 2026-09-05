import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, User, Phone, ArrowLeft, Store } from 'lucide-react';
import { SellerContact } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: number;
}

interface ClientChatViewProps {
  sellerContact: SellerContact;
  onBackToStore: () => void;
  user?: { displayName?: string | null; email?: string | null } | null;
  onRequireAuth?: (reason: 'chat') => void;
}

export const ClientChatView: React.FC<ClientChatViewProps> = ({
  sellerContact,
  onBackToStore,
  user,
  onRequireAuth,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('line_client_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'admin',
        text: 'Bonjour et bienvenue chez LINE ! Tous nos articles sont livrés en mains propres. Vous pouvez nous poser vos questions sur les tailles, les matières ou la livraison ici.',
        timestamp: Date.now() - 3600000,
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('line_client_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!user && onRequireAuth) {
      onRequireAuth('chat');
      return;
    }

    const userText = inputText.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      text: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Automatic helpful answer from distribution team
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-rep-${Date.now()}`,
          sender: 'admin',
          text: 'Merci pour votre message ! Notre distributeur a bien noté votre demande et prépare les informations demandées. Vous pouvez aussi confirmer directement sur WhatsApp si besoin.',
          timestamp: Date.now(),
        }
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-170px)] min-h-[500px] flex flex-col bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Service Distribution LINE
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              En ligne • Réponse rapide
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

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40 dark:bg-[#0E131F]/50">
        <div className="text-center py-2">
          <span className="px-3 py-1 rounded-full text-[11px] bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 font-medium">
            Messagerie directe client • Livraison en mains propres
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'client';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 shadow-xs text-xs sm:text-sm ${
                  isMe
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
                }`}
              >
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
        ].map((quick, idx) => (
          <button
            key={idx}
            onClick={() => {
              const newMsg: ChatMessage = {
                id: `msg-${Date.now()}`,
                sender: 'client',
                text: quick,
                timestamp: Date.now(),
              };
              setMessages((prev) => [...prev, newMsg]);
            }}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors shrink-0"
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
          placeholder="Posez une question sur un vêtement, la taille, la livraison..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
