import { create } from "zustand";
import type { PhaseType, Project } from "@/lib/types";
import type { ChatMessage } from "@/lib/types/chat";
import {
  addChatMessage,
  getChatMessages,
} from "@/lib/db/chat-messages";
import { streamChat } from "@/lib/api/stream-client";
import { buildProjectContext } from "@/lib/chat/context-builder";
import { parseEditSuggestion } from "@/lib/chat/edit-parser";

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  error: string | null;
  togglePanel: () => void;
  loadHistory: (projectId: string) => Promise<void>;
  sendMessage: (
    text: string,
    projectId: string,
    project: Project,
    phaseType: PhaseType,
  ) => Promise<void>;
  updateMessage: (id: number, data: Partial<ChatMessage>) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isOpen: false,
  isStreaming: false,
  error: null,

  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  loadHistory: async (projectId: string) => {
    try {
      const messages = await getChatMessages(projectId);
      set({ messages });
    } catch {
      set({ error: "Failed to load chat history" });
    }
  },

  updateMessage: (id: number, data: Partial<ChatMessage>) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...data } : m,
      ),
    }));
  },

  sendMessage: async (
    text: string,
    projectId: string,
    project: Project,
    phaseType: PhaseType,
  ) => {
    if (get().isStreaming) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Omit<ChatMessage, "id"> = {
      projectId,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    // Persist and add user message
    const userId = await addChatMessage(userMessage);
    const storedUserMsg: ChatMessage = { ...userMessage, id: userId };

    set((state) => ({
      messages: [...state.messages, storedUserMsg],
      isStreaming: true,
      error: null,
    }));

    // Build conversation for API
    const { messages } = get();
    const apiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const projectContext = buildProjectContext(project, phaseType);

    let fullResponse = "";

    try {
      for await (const chunk of streamChat({
        messages: apiMessages,
        projectContext,
        phaseType,
      })) {
        fullResponse += chunk;
        // Update UI with streaming partial response
        set((state) => {
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg?.role === "assistant" && !lastMsg.id) {
            // Update in-progress assistant message
            return {
              messages: [
                ...state.messages.slice(0, -1),
                { ...lastMsg, content: fullResponse },
              ],
            };
          }
          // Add new streaming assistant message (no id yet)
          return {
            messages: [
              ...state.messages,
              {
                projectId,
                role: "assistant" as const,
                content: fullResponse,
                timestamp: Date.now(),
              },
            ],
          };
        });
      }

      // Parse for edit suggestions
      const suggestedEdit = parseEditSuggestion(fullResponse);

      // Persist completed assistant message
      const assistantMessage: Omit<ChatMessage, "id"> = {
        projectId,
        role: "assistant",
        content: fullResponse,
        timestamp: Date.now(),
        suggestedEdit: suggestedEdit ?? undefined,
      };

      const assistantId = await addChatMessage(assistantMessage);

      // Replace the streaming message with the persisted one
      set((state) => ({
        messages: [
          ...state.messages.slice(0, -1),
          { ...assistantMessage, id: assistantId },
        ],
        isStreaming: false,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      // Remove the streaming assistant message if present
      set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        const msgs =
          lastMsg?.role === "assistant" && !lastMsg.id
            ? state.messages.slice(0, -1)
            : state.messages;
        return { messages: msgs, isStreaming: false, error: message };
      });
    }
  },

  clearMessages: () => {
    set({ messages: [], error: null });
  },
}));
