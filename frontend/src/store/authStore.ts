import { create } from "zustand";
import { User } from "@/types";
import { authAPI } from "@/services/api";

interface AuthStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}


export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("token", res.data.token);
    set({ user: res.data.user });
  },

  register: async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem("token", res.data.token);
    set({ user: res.data.user });
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem("token");
    }
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
