import axios from "axios";
import { Application, Interview } from "@/types";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),
};

export const applicationAPI = {
  getAll: () => api.get("/applications"),

  getOne: (id: string) => api.get(`/applications/${id}`),

  create: (data: Partial<Application>) => api.post("/applications", data),

  update: (id: string, data: Partial<Application>) =>
    api.put(`/applications/${id}`, data),

  remove: (id: string) => api.delete(`/applications/${id}`),

  addInterview: (id: string, data: Partial<Interview>) =>
    api.post(`/applications/${id}/interviews`, data),

  getStats: () => api.get("/applications/stats"),

  callAI: (endpoint: string, data: object) => api.post(endpoint, data),
  uploadResume: (formData: FormData) =>
    api.post("/ai/resume-feedback", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export const streamAIRequest = async (
  endpoint: string,
  data: object,
  onChunk: (text: string) => void,
  onDone: () => void,
) => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const response = await fetch(
    `${apiBaseUrl}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getStoredToken()
          ? { Authorization: `Bearer ${getStoredToken()}` }
          : {}),
      },
      credentials: "include", // sends cookies
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Stream request failed");
  }

  //read response chunk by chunk
  const reader = response.body?.getReader();

  //creates a decoder that can turn the bytes into string
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No reader");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    //Turn raw bytes into string
    const chunk = decoder.decode(value);

    //Split stream text into lines, because SSE events are line-based
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        let json;
        try {
          json = JSON.parse(line.slice(6));
        } catch {
          // skip malformed chunks
          continue;
        }

        if (json.error) {
          throw new Error(getStreamErrorMessage(json.error));
        }
        if (json.done) {
          onDone();
          return;
        }
        if (json.text) {
          onChunk(json.text);
        }
      }
    }
  }
};

export const streamChatRequest = async (
  messages: { role: string; content: string }[],
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
) => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const response = await fetch(`${apiBaseUrl}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getStoredToken()
        ? { Authorization: `Bearer ${getStoredToken()}` }
        : {}),
    },
    credentials: "include",
    body: JSON.stringify({ messages, message }),
  });

  if (!response.ok) {
    throw new Error("Chat stream request failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No reader");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        let json;
        try {
          json = JSON.parse(line.slice(6));
        } catch {
          // skip malformed chunks
          continue;
        }

        if (json.error) {
          throw new Error(getStreamErrorMessage(json.error));
        }
        if (json.done) {
          onDone();
          return;
        }
        if (json.text) {
          onChunk(json.text);
        }
      }
    }
  }
};

const getStreamErrorMessage = (error: unknown) => {
  let message = "Something went wrong. Please try again.";

  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);
      message = parsed?.error?.message || parsed?.message || error;
    } catch {
      message = error;
    }
  } else if (typeof error === "object" && error !== null) {
    const parsed = error as { error?: { message?: string }; message?: string };
    message = parsed.error?.message || parsed.message || message;
  }

  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return "AI quota exceeded. Please try again later.";
  }

  return message;
};

export default api;
export { getStoredToken };
