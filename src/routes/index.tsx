import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { AuthPage } from "@/components/AuthPage";
import { ChatLayout } from "@/components/ChatLayout";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ChatBot — AI Chat Assistant" },
      { name: "description", content: "A modern AI chatbot with streaming responses, conversation history, and markdown support." },
    ],
  }),
});

function Index() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { conversations, create, updateTitle, remove } = useConversations(user?.id);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Select first conversation when loaded
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const handleAuth = async (email: string, password: string, mode: "login" | "signup") => {
    if (mode === "login") await signIn(email, password);
    else await signUp(email, password);
  };

  const handleNew = useCallback(async () => {
    const conv = await create();
    if (conv) {
      setActiveConversationId(conv.id);
      return conv.id;
    }
    return null;
  }, [create]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      if (activeConversationId === id) {
        setActiveConversationId(conversations.find((c) => c.id !== id)?.id ?? null);
      }
    },
    [remove, activeConversationId, conversations]
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <ChatLayout
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={setActiveConversationId}
      onNewConversation={handleNew}
      onDeleteConversation={handleDelete}
      onUpdateTitle={updateTitle}
      onSignOut={signOut}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
      userEmail={user.email}
    />
  );
}
