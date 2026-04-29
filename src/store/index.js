import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COUNTRIES } from '../data';

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  mobileMenuOpen: false,
  shareModalOpen: false,
  activeCategory: null,
  searchQuery: '',
  toasts: [],

  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  setShareModalOpen: (v) => set({ shareModalOpen: v }),
  setActiveCategory: (v) => set({ activeCategory: v }),
  setSearchQuery: (v) => set({ searchQuery: v }),

  addToast: (msg, type = 'info') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

// ─── Geo/Country Store ────────────────────────────────────────────────────────
const findCountry = (code) =>
  COUNTRIES.find(c => c.code === code) || COUNTRIES.find(c => c.code === 'SE') || COUNTRIES[0];

export const useGeoStore = create((set) => ({
  country: 'SE',
  countryData: findCountry('SE'),

  setCountry: (code) => set({
    country: code,
    countryData: findCountry(code),
  }),

  detectCountry: async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      const code = data.country_code;
      const found = findCountry(code);
      if (found) {
        set({ country: found.code, countryData: found });
      }
    } catch {
      // Default SE
    }
  },
}));

// ─── Canvas/Collab Store ──────────────────────────────────────────────────────
export const useCollabStore = create((set, get) => ({
  roomId: null,
  participants: [],
  messages: [],
  canvasObjects: [],
  isDrawing: false,
  tool: 'pen', // 'pen' | 'eraser' | 'select'
  color: '#7c3aed',
  strokeWidth: 3,
  isCameraOn: false,
  isMicOn: false,

  setRoomId: (id) => set({ roomId: id }),
  setParticipants: (p) => set({ participants: p }),
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  addCanvasObject: (obj) => set(s => ({ canvasObjects: [...s.canvasObjects, obj] })),
  clearCanvas: () => set({ canvasObjects: [] }),
  setTool: (t) => set({ tool: t }),
  setColor: (c) => set({ color: c }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  setCameraOn: (v) => set({ isCameraOn: v }),
  setMicOn: (v) => set({ isMicOn: v }),
}));

// ─── Wishlist Store (persisted to localStorage under key 'dnb_wishlist') ──────
export const useWishlistStore = create(persist(
  (set, get) => ({
    items: [],

    addItem: (product) => {
      if (get().items.find(i => i.id === product.id)) return false;
      set(s => ({ items: [...s.items, product] }));
      return true;
    },
    removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
    hasItem: (id) => !!get().items.find(i => i.id === id),
    clear: () => set({ items: [] }),
  }),
  { name: 'dnb_wishlist' }
));

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => {
    const existing = get().items.find(i => i.id === product.id);
    if (existing) {
      set(s => ({ items: s.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) }));
    } else {
      set(s => ({ items: [...s.items, { ...product, qty: 1 }] }));
    }
  },
  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  setOpen: (v) => set({ isOpen: v }),

  get totalItems() { return get().items.reduce((sum, i) => sum + i.qty, 0); },
}));
