import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  subject: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  senderType: "user" | "creator";
}

interface MessageStore {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp" | "isRead">) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              isRead: false,
            },
            ...state.messages,
          ],
        })),
      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        })),
      markAsRead: (messageId) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ),
        })),
    }),
    {
      name: "message-storage",
    }
  )
);
