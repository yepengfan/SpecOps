"use client";

import { MarkdownRenderer } from "@/components/editor/markdown-renderer";
import { SuggestedEdit } from "@/components/chat/suggested-edit";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <MarkdownRenderer content={message.content} />
            {message.suggestedEdit && (
              <SuggestedEdit
                message={message}
                projectId={message.projectId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
