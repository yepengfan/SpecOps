"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { X, Loader2, Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatResizeHandle } from "@/components/chat/chat-resize-handle";
import { clearChatMessages } from "@/lib/db/chat-messages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PhaseType, Project } from "@/lib/types";

interface ChatPanelProps {
  projectId: string;
  project: Project;
  phaseType: PhaseType;
}

const STORAGE_KEY = "specops-chat-panel-width";
const DEFAULT_WIDTH = 384;
const DESKTOP_QUERY = "(min-width: 768px)";

function getStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_WIDTH;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? DEFAULT_WIDTH : parsed;
}

function subscribeToDesktop(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getIsDesktop() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getIsDesktopServer() {
  return false;
}

export function ChatPanel({ projectId, project, phaseType }: ChatPanelProps) {
  const {
    messages,
    isOpen,
    isStreaming,
    error,
    togglePanel,
    sendMessage,
    clearMessages,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(getStoredWidth);
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getIsDesktop, getIsDesktopServer);

  const handleWidthChange = useCallback((width: number) => {
    setPanelWidth(width);
  }, []);

  const handleDragEnd = useCallback((width: number) => {
    setPanelWidth(width);
    localStorage.setItem(STORAGE_KEY, String(width));
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show error as toast instead of inline
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    sendMessage(text, projectId, project, phaseType);
  };

  return (
    <>
    {/* Backdrop overlay for mobile */}
    <button
      type="button"
      aria-label="Dismiss"
      className="fixed inset-0 z-40 bg-black/50 md:hidden"
      onClick={togglePanel}
    />
    <div
      data-testid="chat-panel"
      className="fixed right-0 top-0 z-50 flex h-full w-full md:w-auto flex-row"
    >
    {/* Resize handle (desktop only) */}
    <ChatResizeHandle
      panelWidth={panelWidth}
      onWidthChange={handleWidthChange}
      onDragEnd={handleDragEnd}
    />
    <div
      className="flex h-full flex-1 md:flex-none flex-col border-l bg-background shadow-lg"
      style={{ width: isDesktop ? panelWidth : undefined }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">AI Assistant</h2>
        <div className="flex items-center gap-1">
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger asChild>
              <button
                aria-label="Clear history"
                className="rounded-md p-1 hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear chat history</DialogTitle>
                <DialogDescription>
                  Clear all chat history? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await clearChatMessages(projectId);
                    clearMessages();
                    setClearDialogOpen(false);
                  }}
                >
                  Clear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <button
            onClick={togglePanel}
            aria-label="Close"
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <p className="text-center text-sm text-muted-foreground pt-8">
            Ask a question about your project content.
          </p>
        )}
        {messages.map((msg, idx) => (
          <ChatMessage key={msg.id ?? `streaming-${idx}`} message={msg} />
        ))}
        {isStreaming && (
          <div role="status" data-testid="streaming-indicator" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
    </div>
    </>
  );
}
