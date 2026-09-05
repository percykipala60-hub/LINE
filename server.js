import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// CORS for cross-origin requests from Admin (localhost:3001)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory conversation store
let chatConversations = {};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// GET all conversations
app.get('/api/chat/conversations', (req, res) => {
  res.json({ conversations: chatConversations });
});

// POST sync conversations (bidirectional merge between client and admin)
app.post('/api/chat/sync', (req, res) => {
  const incoming = req.body?.conversations;
  if (incoming && typeof incoming === 'object') {
    for (const [id, conv] of Object.entries(incoming)) {
      if (!chatConversations[id]) {
        chatConversations[id] = conv;
      } else {
        const msgMap = new Map();
        (chatConversations[id].messages || []).forEach(m => msgMap.set(m.id, m));
        (conv.messages || []).forEach(m => msgMap.set(m.id, m));
        const mergedMsgs = Array.from(msgMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        
        chatConversations[id] = {
          ...chatConversations[id],
          ...conv,
          messages: mergedMsgs,
          lastMessage: mergedMsgs.length > 0 ? (mergedMsgs[mergedMsgs.length - 1].text || conv.lastMessage) : conv.lastMessage,
          lastMessageTimestamp: mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1].timestamp : conv.lastMessageTimestamp,
          unreadByAdmin: conv.unreadByAdmin ?? chatConversations[id].unreadByAdmin,
          unreadByClient: conv.unreadByClient ?? chatConversations[id].unreadByClient,
          updatedAt: Math.max(conv.updatedAt || 0, chatConversations[id].updatedAt || 0, Date.now()),
        };
      }
    }
  }
  res.json({ success: true, conversations: chatConversations });
});

// Serve static build from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`LINE Store web service running on port ${port}`);
});
