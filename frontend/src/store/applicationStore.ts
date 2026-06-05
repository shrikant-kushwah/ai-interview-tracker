import { create } from "zustand";
import { Application, DashboardStats } from "@/types";
import { applicationAPI } from "@/services/api";

interface ApplicationStore {
  applications: Application[];
  currentApplication: Application | null;
  stats: DashboardStats | null;
  loading: boolean;
  fetchApplications: () => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  createApplication: (data: Partial<Application>) => Promise<void>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  currentApplication: null,
  stats: null,
  loading: false,

  fetchApplications: async () => {
    set({ loading: true });
    const res = await applicationAPI.getAll();
    set({ applications: res.data.data, loading: false });
  },

  fetchApplication: async (id) => {
    const res = await applicationAPI.getOne(id);
    set({ currentApplication: res.data.data });
  },

  createApplication: async (data) => {
    const res = await applicationAPI.create(data);
    set((state) => ({
      applications: [res.data.data, ...state.applications]
    }));
  },

  updateApplication: async (id, data) => {
    const res = await applicationAPI.update(id, data);
    set((state) => ({
      applications: state.applications.map((app) =>
        app._id === id ? res.data.data : app
      ),
      currentApplication: res.data.data
    }));
  },

  deleteApplication: async (id) => {
    await applicationAPI.remove(id);
    set((state) => ({
      applications: state.applications.filter((app) => app._id !== id)
    }));
  },

  fetchStats: async () => {
    const res = await applicationAPI.getStats();
    set({ stats: res.data.data });
  },
}));
