import { useRef, useEffect, useCallback, useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { ChatSidebar } from "./ChatSidebar";
import type { Conversation } from "@/hooks/useConversations";
import type { Msg } from "@/lib/chat-stream";
import { streamChat } from "@/lib/chat-stream";
import { useMessages } from "@/hooks/useMessages";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatLayoutProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => Promise<string | null>;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onSignOut: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  userEmail?: string;
}

export function ChatLayout({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateTitle,
  onSignOut,
  darkMode,
  onToggleDark,
  userEmail,
}: ChatLayoutProps) {
  const { messages, loading: msgsLoading, load, saveMessage, addLocal, updateLastAssistant, clear } =
    useMessages(activeConversationId);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const handleSend = useCallback(
    async (text: string) => {
      let convId = activeConversationId;
      if (!convId) {
        const newId = await onNewConversation();
        if (!newId) return;
        convId = newId;
      }

      const userMsg: Msg = { role: "user", content: text };
      addLocal(userMsg);
      await saveMessage("user", text);

      // Auto-title on first message
      if (messages.length === 0) {
        const title = text.length > 40 ? text.slice(0, 40) + "..." : text;
        onUpdateTitle(convId, title);
      }

      setStreaming(true);
      let fullResponse = "";

      const allMessages = [...messages, userMsg];

      abortRef.current = new AbortController();

      await streamChat({
        messages: allMessages,
        signal: abortRef.current.signal,
        onDelta: (chunk) => {
          fullResponse += chunk;
          updateLastAssistant(fullResponse);
        },
        onDone: async () => {
          setStreaming(false);
          if (fullResponse) {
            await saveMessage("assistant", fullResponse);
          }
        },
        onError: (err) => {
          setStreaming(false);
          updateLastAssistant(`⚠️ Error: ${err}`);
        },
      });
    },
    [activeConversationId, messages, onNewConversation, addLocal, saveMessage, updateLastAssistant, onUpdateTitle]
  );

  const handleNew = async () => {
    clear();
    await onNewConversation();
    setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={onDeleteConversation}
          onSignOut={onSignOut}
          onClose={() => setSidebarOpen(false)}
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          userEmail={userEmail}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium truncate text-foreground">
            {conversations.find((c) => c.id === activeConversationId)?.title || "New Chat"}
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {!activeConversationId && messages.length === 0 && !msgsLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Start a conversation and I'll do my best to assist you.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {streaming && messages[messages.length - 1]?.role !== "assistant" && (
              <TypingIndicator />
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <ChatInput onSend={handleSend} disabled={streaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
