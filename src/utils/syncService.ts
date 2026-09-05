import { SellerContact, Product } from '../types';
import { DEFAULT_SELLER_CONTACT, INITIAL_PRODUCTS } from '../data/mockData';
import { app, db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const STORAGE_CONTACT_KEY = 'line_seller_contact';
const STORAGE_PRODUCTS_KEY = 'line_products_catalog';
const CHANNEL_NAME = 'line_realtime_sync_channel';

// BroadcastChannel for instant local inter-tab/port communication
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHANNEL_NAME)
  : null;

export const syncService = {
  // --- SELLER CONTACT SYNC ---
  getSellerContact(): SellerContact {
    if (typeof window === 'undefined') return DEFAULT_SELLER_CONTACT;
    const saved = localStorage.getItem(STORAGE_CONTACT_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_SELLER_CONTACT;
  },

  saveSellerContact(contact: SellerContact) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(contact));
    
    // Broadcast immediately to client tabs
    if (channel) {
      channel.postMessage({ type: 'SELLER_CONTACT_UPDATED', payload: contact });
    }

    // Persist to Firestore if available
    if (db) {
      try {
        setDoc(doc(db, 'settings', 'sellerContact'), contact, { merge: true }).catch(() => {});
      } catch (e) { /* ignore */ }
    }
  },

  subscribeToSellerContact(callback: (contact: SellerContact) => void) {
    // 1. Initial value
    callback(this.getSellerContact());

    // 2. Listen to BroadcastChannel (Instant inter-port sync)
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SELLER_CONTACT_UPDATED') {
        callback(event.data.payload);
      }
    };
    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }

    // 3. Listen to window storage events
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_CONTACT_KEY && event.newValue) {
        try {
          callback(JSON.parse(event.newValue));
        } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Listen to Firestore real-time snapshot
    let unsubFirestore = () => {};
    if (db) {
      try {
        unsubFirestore = onSnapshot(doc(db, 'settings', 'sellerContact'), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as SellerContact;
            callback(data);
            localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(data));
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

  // --- PRODUCTS CATALOG SYNC ---
  getProducts(): Product[] {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));

    if (channel) {
      channel.postMessage({ type: 'PRODUCTS_UPDATED', payload: products });
    }

    if (db) {
      try {
        setDoc(doc(db, 'catalog', 'products'), { items: products }, { merge: true }).catch(() => {});
      } catch (e) { /* ignore */ }
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    callback(this.getProducts());

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PRODUCTS_UPDATED') {
        callback(event.data.payload);
      }
    };
    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_PRODUCTS_KEY && event.newValue) {
        try {
          callback(JSON.parse(event.newValue));
        } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);

    let unsubFirestore = () => {};
    if (db) {
      try {
        unsubFirestore = onSnapshot(doc(db, 'catalog', 'products'), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.items && Array.isArray(data.items)) {
              callback(data.items);
              localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data.items));
            }
          }
        }, () => {});
      } catch (e) { /* ignore */ }
    }

    return () => {
      if (channel) channel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      unsubFirestore();
    };
  }
};
