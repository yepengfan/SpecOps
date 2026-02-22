import Dexie from "dexie";
import { db } from "@/lib/db/database";
import type { ChatMessage } from "@/lib/types/chat";

class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error instanceof Dexie.QuotaExceededError) {
      throw new StorageError("Storage is full");
    }
    if (error instanceof Dexie.OpenFailedError) {
      throw new StorageError("Unable to load");
    }
    throw error;
  }
}

export async function addChatMessage(
  message: Omit<ChatMessage, "id">,
): Promise<number> {
  return withErrorHandling(async () => {
    return db.chatMessages.add(message as ChatMessage);
  });
}

export async function getChatMessages(
  projectId: string,
): Promise<ChatMessage[]> {
  return withErrorHandling(async () => {
    return db.chatMessages
      .where("projectId")
      .equals(projectId)
      .sortBy("timestamp");
  });
}

export async function updateChatMessage(
  id: number,
  data: Partial<ChatMessage>,
): Promise<void> {
  return withErrorHandling(async () => {
    await db.chatMessages.update(id, data);
  });
}

export async function clearChatMessages(
  projectId: string,
): Promise<void> {
  return withErrorHandling(async () => {
    await db.chatMessages.where("projectId").equals(projectId).delete();
  });
}

export async function deleteChatMessagesByProject(
  projectId: string,
): Promise<void> {
  return clearChatMessages(projectId);
}
