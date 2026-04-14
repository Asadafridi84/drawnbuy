import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      // ── Register ──────────────────────────────────────────────────────────
      register: async ({ email, password, name }) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // token delivered via httpOnly cookie only
            body: JSON.stringify({ email, password, name }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Registration failed');
          // Store only public user data — never store the token in JS-accessible storage
          set({ user: data.user, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, error: err.message };
        }
      },

      // ── Login ─────────────────────────────────────────────────────────────
      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // token delivered via httpOnly cookie only
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');
          // Store only public user data — never store the token in JS-accessible storage
          set({ user: data.user, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, error: err.message };
        }
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await fetch(`${API}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch {}
        set({ user: null, error: null });
      },

      // ── Restore session ───────────────────────────────────────────────────
      restoreSession: async () => {
        try {
          const res = await fetch(`${API}/api/auth/me`, {
            credentials: 'include', // relies on httpOnly cookie
          });
          if (!res.ok) { set({ user: null }); return; }
          const user = await res.json();
          set({ user });
        } catch {
          set({ user: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'drawnbuy-auth',
      // Only persist public user profile — never persist tokens in localStorage
      partialize: (state) => ({ user: state.user }),
    }
  )
);
