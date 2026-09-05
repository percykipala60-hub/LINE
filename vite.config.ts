import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function chatApiPlugin() {
  const inMemoryConvs: Record<string, any> = {};
  return {
    name: 'chat-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Handle CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.url === '/api/chat/conversations' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ conversations: inMemoryConvs }));
          return;
        }

        if (req.url === '/api/chat/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const incoming = data?.conversations;
              if (incoming && typeof incoming === 'object') {
                for (const [id, conv] of Object.entries(incoming as Record<string, any>)) {
                  if (!inMemoryConvs[id]) {
                    inMemoryConvs[id] = conv;
                  } else {
                    const msgMap = new Map();
                    (inMemoryConvs[id].messages || []).forEach((m: any) => msgMap.set(m.id, m));
                    (conv.messages || []).forEach((m: any) => msgMap.set(m.id, m));
                    const mergedMsgs = Array.from(msgMap.values()).sort((a: any, b: any) => a.timestamp - b.timestamp);
                    inMemoryConvs[id] = {
                      ...inMemoryConvs[id],
                      ...conv,
                      messages: mergedMsgs,
                      lastMessage: mergedMsgs.length > 0 ? (mergedMsgs[mergedMsgs.length - 1].text || conv.lastMessage) : conv.lastMessage,
                      lastMessageTimestamp: mergedMsgs.length > 0 ? mergedMsgs[mergedMsgs.length - 1].timestamp : conv.lastMessageTimestamp,
                      unreadByAdmin: conv.unreadByAdmin ?? inMemoryConvs[id].unreadByAdmin,
                      unreadByClient: conv.unreadByClient ?? inMemoryConvs[id].unreadByClient,
                      updatedAt: Math.max(conv.updatedAt || 0, inMemoryConvs[id].updatedAt || 0, Date.now()),
                    };
                  }
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, conversations: inMemoryConvs }));
            } catch (e: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), chatApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
